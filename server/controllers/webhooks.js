import Stripe from "stripe";
import { Webhook } from "svix";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

let User;
try {
  User = (await import("../models/User.js")).default;
} catch (importError) {
  console.error("Failed to import User model:", importError);
  throw importError;
}

//API Controller Function to manage clerk user with database
export const clerkWebhooks = async (req, res) => {
  console.log('Webhook received');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set');
    }

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    console.log('Webhook instance created');

    // Ensure we're working with Buffer data
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body);
    const payload = JSON.parse(rawBody);
    console.log('Parsed payload:', payload);

    const headerPayload = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    };
    console.log('Header payload:', headerPayload);

    try {
      await whook.verify(rawBody, headerPayload);
      console.log('Webhook verified successfully');
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ 
        error: 'Webhook verification failed',
        details: err.message 
      });
    }

    const { data, type } = payload;
    console.log('Processing webhook type:', type);

    switch (type) {
      case 'user.created': {
        console.log('Creating user with data:', data);
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || data.imageUrl,
        };
        console.log('Formatted user data:', userData);
        
        try {
          const user = await User.create(userData);
          console.log('User created successfully:', user);
          res.json({ success: true, user });
        } catch (dbError) {
          console.error('Database error while creating user:', dbError);
          throw dbError;
        }
        break;
      }

      case 'user.updated': {
        console.log('Updating user with data:', data);
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || data.imageUrl,
        };
        console.log('Formatted user data:', userData);
        
        try {
          const user = await User.findByIdAndUpdate(data.id, userData, { new: true });
          console.log('User updated successfully:', user);
          res.json({ success: true, user });
        } catch (dbError) {
          console.error('Database error while updating user:', dbError);
          throw dbError;
        }
        break;
      }

      case 'user.deleted': {
        console.log('Deleting user:', data.id);
        try {
          const user = await User.findByIdAndDelete(data.id);
          console.log('User deleted successfully:', user);
          res.json({ success: true, user });
        } catch (dbError) {
          console.error('Database error while deleting user:', dbError);
          throw dbError;
        }
        break;
      }

      default:
        console.log('Unhandled webhook type:', type);
        res.json({ success: true, message: 'Webhook received but not handled' });
        break;
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    console.error('Request headers:', req.headers);
    console.error('Request body:', req.body.toString());
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
export const stripeWebhooks = async(req,res)=> {
   const sig = request.headers['stripe-signature'];

    let event;

    try {
      event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
    }

      switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;}
      const paymentIntentId = paymentIntent.id;
    

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId
      })

      const {purchaseId} = session.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId)

      const userData = User.findById(purchaseData.userId)

      const courseData = await Course.findById(purchaseData.courseId.toString())

      courseData.enrolledStudents.push(userData)
      await courseData.save()
      userData.enrolledCousres.push(courseData._id)
      await userData.save()

      purchaseData.status = 'completed'
      await purchaseData.save()
      
      break;
    case 'payment_intent.payment_failed':{
      const paymentMethod = event.data.object;
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
    

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId
      })

      const {purchaseId} = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId)
      purchaseData.status = 'failed'
      await purchaseData.save()
      break;}
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.json({received: true});

}
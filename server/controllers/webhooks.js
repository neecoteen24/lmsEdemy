import { Webhook } from "svix";
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
  console.log('All Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('svix-id:', req.headers['svix-id']);
  console.log('svix-timestamp:', req.headers['svix-timestamp']);
  console.log('svix-signature:', req.headers['svix-signature']);
  
  try {
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is not set in environment variables');
      throw new Error('CLERK_WEBHOOK_SECRET is not set');
    }

    console.log('CLERK_WEBHOOK_SECRET length:', process.env.CLERK_WEBHOOK_SECRET.length);
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    console.log('Webhook instance created');

    // Log the raw body
    console.log('Raw body type:', typeof req.body);
    console.log('Raw body instanceof Buffer:', req.body instanceof Buffer);
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body);
    
    // Parse the raw body
    const payload = JSON.parse(rawBody);
    console.log('Parsed payload:', payload);

    const headerPayload = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    };
    console.log('Header payload for verification:', headerPayload);

    try {
      await whook.verify(rawBody, headerPayload);
      console.log('Webhook verified successfully');
    } catch (err) {
      console.error('Webhook verification failed:', err);
      console.error('Verification attempted with:', {
        headerPayload,
        secretLength: process.env.CLERK_WEBHOOK_SECRET.length,
        bodyLength: rawBody.length
      });
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
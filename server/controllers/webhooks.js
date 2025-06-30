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
  try {
    console.log('Received webhook:', req.body.type);
    
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });

    const { data, type } = req.body;
    console.log('Webhook data:', JSON.stringify(data, null, 2));

    switch (type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || data.imageUrl,
        };
        console.log('Creating user:', userData);
        const user = await User.create(userData);
        console.log('User created:', user);
        res.json({ success: true, user });
        break;
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || data.imageUrl,
        };
        console.log('Updating user:', data.id, userData);
        const user = await User.findByIdAndUpdate(data.id, userData, { new: true });
        console.log('User updated:', user);
        res.json({ success: true, user });
        break;
      }

      case 'user.deleted': {
        console.log('Deleting user:', data.id);
        const user = await User.findByIdAndDelete(data.id);
        console.log('User deleted:', user);
        res.json({ success: true, user });
        break;
      }

      default:
        console.log('Unhandled webhook type:', type);
        res.json({ success: true, message: 'Webhook received but not handled' });
        break;
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    console.error('Request body:', req.body);
    console.error('Request headers:', req.headers);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
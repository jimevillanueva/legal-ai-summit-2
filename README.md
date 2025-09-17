<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1O7Z91RR3EZhueSOB_878lOpHzdXbXSci

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Admin Panel

The application includes an admin panel accessible at `/admin` that provides administrative functionality for managing the legal AI summit.

### Admin Authentication

- **Access**: Navigate to `/admin` in your browser
- **Authentication**: Uses Supabase authentication with email/password
- **Authorization**: Only users with `role = 'admin'` in the `user_profiles` table can access
- **Security**: The system verifies both Supabase authentication and admin role before granting access

### Admin Features

- **Authentication**: Secure login with Supabase auth and role verification
- **Welcome Screen**: Clean interface after successful login with quick access to main agenda
- **Session Management**: Full CRUD operations for summit sessions (from main interface)
- **Speaker Management**: Manage event speakers (from main interface)
- **Data Export/Import**: Backup and restore functionality (from main interface)
- **User Management**: View and manage user roles

### Setting Up Admin Users

To create an admin user:

1. Create a user account in Supabase Auth
2. Insert a record in the `user_profiles` table with `role = 'admin'`:

```sql
INSERT INTO user_profiles (id, email, name, role) 
VALUES ('user-uuid', 'admin@example.com', 'Admin Name', 'admin');
```

### User Roles

- **Admin**: Full access to all features and admin panel
- **User**: Access to view and basic interaction (users in `contacts` table)
- **Guest**: Public access with limited functionality

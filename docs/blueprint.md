# **App Name**: Pariposhan : building safer food culture

## Core Features:

- User Authentication: Secure sign-up and login using Google Sign-in or Email/Password, managing user profiles including an 'isAdmin' flag.
- Community Post Management: Users can create new posts (Fact Cards) with titles, content, images, and assign them to categories. The main feed displays posts with author badges, timestamps, interaction bars (likes, comments), and allows post authors to edit their own posts.
- Post Interaction and Engagement: Users can like posts and add comments. A counter tracks likes for each post.
- Reporting System: A 'Flag' button on each post allows users to report inappropriate content by selecting a reason (e.g., 'Inaccurate Info', 'Spam'). These reports are stored for administrative review.
- AI Safety Assistant Chatbot: A floating chatbot icon on the homepage provides instant food safety tips or answers common questions using an intelligent tool to pull information from a curated knowledge base.
- Admin Moderation Dashboard: A secure, admin-only interface accessible at '/admin' to view reported posts, take action by deleting posts, dismissing reports, or initiating user account deletions via Firebase Cloud Functions.
- Content Search and Categorization: Users can search community posts using keywords in the header. A sidebar provides category navigation (e.g., 'Food Safety Alerts', 'Label Education') to filter the main feed.

## Style Guidelines:

- Color Palette: A light scheme emphasizing freshness and trustworthiness. Primary: a deep, fresh green (#299963); Background: a very light sage green (#ECF6F0); Accent: a brighter yellowish-green for call-to-actions (#8ADF5E).
- Font: 'Inter' (sans-serif) for both headlines and body text, providing a clean, modern, and highly readable user experience across the application.
- Icons: Use 'Lucide-React' for a consistent set of clean, professional, and easily recognizable outline-style icons throughout the platform.
- Page Layout: A structured layout featuring a persistent header (search bar, 'New Post' button), a responsive sidebar for category navigation, and a main content area for a vertical feed of 'Fact Cards'.
- Subtle Animations: Incorporate minimal and smooth animations for interactions like hovering over 'Fact Cards', submitting reports, and modal transitions, ensuring a professional and unintrusive user experience.
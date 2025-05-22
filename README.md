This document provides a comprehensive introduction to the Engineering Hub (Eng Hub) application, a Next.js-based web platform designed for engineering students and professionals. It outlines the system's purpose, core features, and high-level architecture to help developers understand the overall structure of the codebase.
Purpose and Scope
Eng Hub is an engineering learning platform that facilitates educational resource management, student collaboration, and technical assistance through an integrated AI chatbot. The platform serves as a centralized hub for engineering education with features for course management, task tracking, note-taking, scheduling, and GPA calculation.
For detailed information about specific subsystems, refer to:
•	Authentication implementation: Authentication System
•	User interface components: Dashboard and UI
•	Data storage and management: Data Management
•	API implementation details: API Routes
Sources: app/layout.jsx8-11 app/page.jsx20-23
System Architecture
The Engineering Hub employs a modern web application architecture based on Next.js, with client-side and server-side components working together to deliver a seamless user experience.
![image](https://github.com/user-attachments/assets/ae536f58-7323-4c13-a515-4cc1d6aeef5a)
Key Technologies
The application leverages the following technologies:
Technology	Purpose
Next.js	Core framework for server-rendered React applications
React	UI component library
Tailwind CSS	Utility-first CSS framework for styling
shadcn/ui	UI component system based on Tailwind
JSON files	File-based data storage instead of traditional database
OpenAI API	Integration for AI chatbot functionality
Sources: app/globals.css components.json app/layout.jsx1-4
Core Components and Features
Authentication System
The application includes a complete authentication system with user registration, login, password management, and profile updating capabilities. User data is stored in JSON files rather than a traditional database.
![image](https://github.com/user-attachments/assets/c9c1dc9f-a2ef-40c7-9df7-48785b2184ac)
Dashboard Interface
The dashboard serves as the main interface after authentication, providing access to various features organized into sections:
![image](https://github.com/user-attachments/assets/e3c3a029-2956-4bc1-850d-15009f2d4c27)
Data Management
The platform uses a file-based data storage system instead of a traditional database. User data, course information, and uploaded files are organized in a structured directory hierarchy.
Data Type	Storage Location	Format
User accounts	users.json	JSON file
Courses	courses/user_id.json	JSON files per user
Notes	notes/user_id.json	JSON files per user
Tasks	tasks/user_id.json	JSON files per user
Schedules	schedules/user_id.json	JSON files per user
GPA records	gpa/user_id.json	JSON files per user
Uploaded files	files/user_id/course_id/category_id/	Actual files
Theme System
The application includes a theme system with light and dark mode support, using Tailwind CSS for styling with CSS variables for theming.
![image](https://github.com/user-attachments/assets/15942840-8cd4-46b9-be27-e305b325e9c0)
System Boundaries and Interfaces
External Interfaces
The application interacts with external systems:
1.	OpenAI API: Used for the chatbot functionality, providing AI-powered assistance to engineering students.
User Interface Entry Points
The main entry points for user interaction:
1.	Welcome Page: The initial landing page with options to sign in or create an account.
2.	Authentication Pages: Login, signup, and forgot password pages.
3.	Dashboard: The main interface after authentication with access to all features.
4.	Chatbot: AI-powered assistance for engineering students.
Sources: app/page.jsx5-45
Conclusion
The Engineering Hub is a comprehensive learning platform built with modern web technologies to support engineering education. Its modular architecture separates concerns between client and server components, with a file-based storage system that eliminates the need for a traditional database. The platform's core features—course management, personal organization tools, and AI assistance—are designed to enhance the engineering education experience.


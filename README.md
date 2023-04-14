# TIF Assignment API
- This API provides functionality to manage communities and their members. Users can create communities and add members to it, while community admins can add and remove members.

# Tech Stack
- `Node.js v18+`
- Database: `MySQL`
- ORM: `Sequelize`
- Library: `@theinternetfolks/snowflake`

# Installation
- Clone the repository - `git clone https://github.com/Sirajuddin135/TIF-Assignment.git`
- Install the dependencies by running `npm install`
- Create a `.env` file and configure the database connection and other environment variables as needed.
- Start the server: `npm start`

# Validation
- The API performs validation of the input data to ensure that it meets the expected format and rules. If the input data is not valid, the API will return a validation error with the corresponding HTTP status code.

# Security
- The API uses JWT for authentication and authorization. Each request to the API must include a valid JWT token in the authorization header. The API also enforces role-based access control to restrict certain operations to users with specific roles.

# Thank You

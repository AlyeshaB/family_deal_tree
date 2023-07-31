# Family-Tree-Deals

Family-Tree-Deals is a web application built with Node.js.

### Installing dependencies

The "node_modules" directory isn't included in the repository or directory. Navigate into the project directory and run the following command to download and install the necessary dependencies:

npm install

### Database setup

An SQL file named `family-tree-deals.sql` has been included. To setup the database, you need to import this file into your MySQL server.
You may need to update the db.js file in the config folder with your database connection details.

### Running the application

After setting up the database and installing the dependencies, you can start the application.

To start the server, use the following command:

nodemon app.js

To start the API, open a new terminal window in the same directory and run the following command:

nodemon index.js

These two processes need to be running simultaneously for the application to function correctly.

## Usage

Once you've started the server and API, open your web browser and navigate to `http://localhost:3000` to start using the Family-Tree-Deals application.

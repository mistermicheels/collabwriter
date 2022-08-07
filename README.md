Project status:

-   🔧 In maintenance mode
    -   New features will not be added.
    -   A best-effort attempt will be made to keep the current functionality working.
-   🔒 Not looking for code contributions from other developers

# CollabWriter

This is CollabWriter, a massively multiplayer online democratic suggestion-based writing application.

[Click here to open the application](https://collabwriter.herokuapp.com/)

## How it works

-   The frontend is built using HTML, CSS, vanilla JS and Bootstrap.
-   All interaction between backend and frontend happens through JSON messages over WebSockets.
-   The application always shows the last part of the full text. When new words are added, the existing words stay where they are, except for moving up when a new line needs to be added. This behavior is similar to writing text on a typewriter. In order to accomplish this, we use `white-space: pre-line;` which breaks lines automatically but also respects explicit line breaks in the text. Any automatic line breaks are then detected and replaced by explicit ones that we control.
-   Random word suggestions are obtained from the [random-words](https://www.npmjs.com/package/random-words) package.
-   Non-random word suggestions are retrieved from the [Datamuse API](https://www.datamuse.com/api/). Within a sentence, suggestions for the next word are words that typically follow the previous word in the sentence. For the first word of a new sentence, suggestions are words that are strongly associated with the last word of the previous sentence.

## Running locally

You can run the application with automatic restarts on backend code changes using `npm run start`. By default, the application is served at port 3000, but you can change this through the `PORT` environment variable.

In order to run the backend, you need a running PostgreSQL instance and a database you can use. By default, the application expects to be able to connect to the right database using the connection string `postgresql://postgres:admin@localhost:5432/collabwriter`. You can change this using the `DATABASE_URL` environment variable. By default, the application also connects to the database using SSL. You can override this by setting the `DATABASE_SSL` environment variable to `false`. If you use the `npm run start` script, this is already taken care of.

One way to get a PostgreSQL instance up and running so you can successfully run `npm run start` is the Docker command `docker run --name collabwriter-postgres -e POSTGRES_DB=collabwriter -e POSTGRES_PASSWORD=admin -d -p 5432:5432 postgres` (based on the standard `postgres` Docker image). You can then stop and restart the container using `docker container stop collabwriter-postgres` and `docker container start collabwriter-postgres`.

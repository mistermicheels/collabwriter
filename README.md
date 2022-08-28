Project status:

-   🔧 In maintenance mode
    -   New features will not be added.
    -   A best-effort attempt will be made to keep the current functionality working.
-   🔒 Not looking for code contributions from other developers

# CollabWriter

This is CollabWriter, a massively multiplayer online democratic suggestion-based writing application.

[Click here to open the application](https://collabwriter.fly.dev/)

## How it works

-   The frontend is built using HTML, CSS, vanilla JS and Bootstrap.
-   All interaction between backend and frontend happens through JSON messages over WebSockets.
-   The application always shows the last part of the full text. When new words are added, the existing words stay where they are, except for moving up when a new line needs to be added. This behavior is similar to writing text on a typewriter. In order to accomplish this, we use `white-space: pre-line;` which breaks lines automatically but also respects explicit line breaks in the text. Any automatic line breaks are then detected and replaced by explicit ones that we control.
-   Random word suggestions are obtained from the [random-words](https://www.npmjs.com/package/random-words) package.
-   Non-random word suggestions are retrieved from the [Datamuse API](https://www.datamuse.com/api/). Within a sentence, suggestions for the next word are words that typically follow the previous word in the sentence. For the first word of a new sentence, suggestions are words that are strongly associated with the last word of the previous sentence.

## Running locally

You can run the application with automatic restarts on backend code changes using `npm run start-no-storage`. By default, the application is served at port 3000, but you can change this through the `PORT` environment variable. When you run the application like this, the text is kept in memory but not stored in any persistent way.

In order to run the application with persistent storage, you need to set a `DATABASE_URL` environment variable that points to a PostgreSQL database (yes, PostgreSQL is a huge overkill for this scenario). If your database does not support SSL, you need to set the `DATABASE_SSL` environment variable to `false`. You can use `npm run start-default-storage` to start the application with `DATABASE_URL` set to `postgresql://postgres:admin@localhost:5432/collabwriter` and `DATABASE_SSL` set to `false`.

One way to get a PostgreSQL instance up and running so you can successfully run `npm run start-default-storage` is the Docker command `docker run --name collabwriter-postgres -e POSTGRES_DB=collabwriter -e POSTGRES_PASSWORD=admin -d -p 5432:5432 postgres` (based on the standard `postgres` Docker image). You can then stop and restart the container using `docker container stop collabwriter-postgres` and `docker container start collabwriter-postgres`.

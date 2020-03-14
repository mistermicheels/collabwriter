# CollabWriter

This is CollabWriter, a massively multiplayer online democratic suggestion-based writing application.

[Click here to open the application](http://collabwriter.herokuapp.com/) (you might need to wait for the server to start)

## How it works

-   The frontend is built using HTML, CSS and vanilla JS.
-   All interaction between backend and frontend happens through JSON messages over WebSockets.
-   The application always shows the last part of the full text. When new words are added, the existing words stay where they are, except for moving up when a new line needs to be added. This behavior is similar to writing text on a typewriter. In order to accomplish this, we use `white-space: pre-line;` which breaks lines automatically but also respects explicit line breaks in the text. Any automatic line breaks are then detected and replaced by explicit ones that we control.
-   Random word suggestions are obtained from the [random-words](https://www.npmjs.com/package/random-words) package.
-   Non-random word suggestions are retrieved from the [Datamuse API](https://www.datamuse.com/api/). Within a sentence, suggestions for the next word are words that typically follow the previous word in the sentence. For the first word of a new sentence, suggestions are words that are strongly associated with the last word of the previous sentence.

## Running locally

You can run the application with automatic restarts on backend code changes using `npm run start`. By default, the application is served at port 3000, but you can change this through the `PORT` environment variable.

In order to run the backend, you need a running Redis instance. By default, the application expects to find that Redis instance at `redis://localhost:6379`. You can change this using the `REDIS_URL` environment variable. One way to get a Redis instance up and running at `redis://localhost:6379` is the Docker command `docker run --name local-redis -d -p 6379:6379 redis` (based on the standard `redis` Docker image). You can then stop and start the container using `docker container stop local-redis` and `docker container start local-redis`.

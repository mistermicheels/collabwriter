# CollabWriter

This is CollabWriter, a massively multiplayer online democratic suggestion-based writing application. This application allows people from all over the world to collaborate on writing a story. Words are added, one by one, by voting on which word to use from a set of suggestions. Some of the suggestions are based on the last chosen word, some are random. After each round, the suggestion that received the most votes is added to the current text. If no votes were cast during a round, nothing is added to the text and the application presents a new set of suggestions. As long as people are voting, the story gets one word longer with each voting round (not entirely true, because the period to end a sentence also needs a voting round). Even without other people interfering with your sentence-building skills, it may be a challenge in itself to build some sentences that look like a sane person wrote them. Some parts of the text will probably look like they were written by a drunk toddler and five layers of Google Translate. In any case, have fun and feel free to contribute to the story.

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

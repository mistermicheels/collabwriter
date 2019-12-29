import { mock, instance, reset, when, verify } from "ts-mockito";

import { TextStorage } from "./TextStorage";
import { TextTracker } from "./TextTracker";

describe("TextTracker", () => {
    const mockTextStorageDefinition = mock(TextStorage);
    const mockTextStorageInstance = instance(mockTextStorageDefinition);

    beforeEach(() => {
        reset(mockTextStorageDefinition);
    });

    async function getTextTrackerForStoredText(storageText: string) {
        when(mockTextStorageDefinition.retrieveText()).thenResolve(storageText);

        const textTracker = new TextTracker(mockTextStorageInstance);
        await textTracker.initializeFromStorage();

        return textTracker;
    }

    test("it should initialize with initial text if storage is empty", async () => {
        const textTracker = await getTextTrackerForStoredText("");

        expect(textTracker.getFullText()).toBe("This is the start of the story.");
        expect(textTracker.getLastActualWord()).toBe("story");
        expect(textTracker.getLastWord()).toBe(".");
    });

    test("it should initialize with the text from the storage if it's there", async () => {
        const storedText = "This is the start of the story. After that";
        const textTracker = await getTextTrackerForStoredText(storedText);

        expect(textTracker.getFullText()).toBe(storedText);
        expect(textTracker.getLastActualWord()).toBe("that");
        expect(textTracker.getLastWord()).toBe("that");
    });

    test("it should allow adding an actual new word", async () => {
        const storedText = "This is the start of the story. After that";
        const textTracker = await getTextTrackerForStoredText(storedText);

        textTracker.addNewWord("event");

        const fullText = textTracker.getFullText();
        expect(fullText).toBe(storedText + " event");
        expect(textTracker.getLastActualWord()).toBe("event");
        expect(textTracker.getLastWord()).toBe("event");

        verify(mockTextStorageDefinition.storeText(fullText)).once();
    });

    test("it should allow adding a period", async () => {
        const storedText = "This is the start of the story. After that";
        const textTracker = await getTextTrackerForStoredText(storedText);

        textTracker.addNewWord(".");

        const fullText = textTracker.getFullText();
        expect(fullText).toBe(storedText + ".");
        expect(textTracker.getLastActualWord()).toBe("that");
        expect(textTracker.getLastWord()).toBe(".");

        verify(mockTextStorageDefinition.storeText(fullText)).once();
    });

    test("it should truncate the text if it gets too long", async () => {
        const storedText = new Array(TextTracker.MAX_WORDS).fill("word").join(" ");
        expect(storedText.split(" ").length).toBe(TextTracker.MAX_WORDS);
        const textTracker = await getTextTrackerForStoredText(storedText);

        textTracker.addNewWord("newWord");

        const fullText = textTracker.getFullText();
        expect(fullText.split(" ").length).toBe(TextTracker.MAX_WORDS);
        expect(fullText.includes("newWord")).toBe(true);

        verify(mockTextStorageDefinition.storeText(fullText)).once();
    });
});

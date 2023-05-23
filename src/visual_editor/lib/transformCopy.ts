import openai from "./openAI";

export type CopyMode = "energetic" | "concise" | "humorous";

const getPrompt = (
  text: string,
  mode: CopyMode
) => `Improve the following text, delimited by hypens, into a version that is more ${mode}. Keep the length of the sentence same.
---
${text}
---
`;

const transformCopy = async (text: string, mode: CopyMode) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: getPrompt(text, mode),
      },
    ],
  });
  return response.data.choices[0].message?.content;
};

export default transformCopy;

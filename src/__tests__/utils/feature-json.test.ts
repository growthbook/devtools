import { featuresJsonFromEncodedCookieValue } from "../../utils/feature-json";

describe("feature json utils", () => {
  describe("featuresJsonFromEncodedCookieValue", () => {
    it("should return parsed JSON", () => {
      const input =
        "%7B%22banner_text%22%3A%7B%22defaultValue%22%3A%22Welcome+to+Acme+Donuts%21%22%2C%22rules%22%3A%5B%7B%22condition%22%3A%7B%22country%22%3A%22france%22%7D%2C%22force%22%3A%22Bienvenue+au+Beignets+Acme+%21%22%7D%2C%7B%22condition%22%3A%7B%22country%22%3A%22spain%22%7D%2C%22force%22%3A%22%C2%A1Bienvenidos+y+bienvenidas+a+Donas+Acme%21%22%7D%5D%7D%2C%22dark_mode%22%3A%7B%22defaultValue%22%3Afalse%2C%22rules%22%3A%5B%7B%22condition%22%3A%7B%22loggedIn%22%3Atrue%7D%2C%22force%22%3Atrue%2C%22coverage%22%3A0.5%2C%22hashAttribute%22%3A%22id%22%7D%5D%7D%2C%22donut_price%22%3A%7B%22defaultValue%22%3A2.5%2C%22rules%22%3A%5B%7B%22condition%22%3A%7B%22employee%22%3Atrue%7D%2C%22force%22%3A0%7D%5D%7D%2C%22meal_overrides_gluten_free%22%3A%7B%22defaultValue%22%3A%7B%22meal_type%22%3A%22standard%22%2C%22dessert%22%3A%22Strawberry+Cheesecake%22%7D%2C%22rules%22%3A%5B%7B%22condition%22%3A%7B%22dietaryRestrictions%22%3A%7B%22%24elemMatch%22%3A%7B%22%24eq%22%3A%22gluten_free%22%7D%7D%7D%2C%22force%22%3A%7B%22meal_type%22%3A%22gf%22%2C%22dessert%22%3A%22French+Vanilla+Ice+Cream%22%7D%7D%5D%7D%7D";

      const result = featuresJsonFromEncodedCookieValue(input);

      expect(result!.banner_text).toEqual({
        defaultValue: "Welcome to Acme Donuts!",
        rules: [
          {
            condition: {
              country: "france",
            },
            force: "Bienvenue au Beignets Acme !",
          },
          {
            condition: {
              country: "spain",
            },
            force: "¡Bienvenidos y bienvenidas a Donas Acme!",
          },
        ],
      });
    });
  });
});

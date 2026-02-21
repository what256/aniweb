const { META, ANIME } = require('@consumet/extensions');

async function test() {
    console.log("Testing META.Anilist...");
    const anilist = new META.Anilist();

    try {
        console.log("Searching for 'naruto'...");
        const metaSearch = await anilist.search("naruto");
        console.log("META.Anilist Search Results:", metaSearch);

        console.log("\nFetching trending...");
        const metaTrending = await anilist.fetchTrendingAnime();
        console.log("META.Anilist Trending Results:", metaTrending);
    } catch (e) {
        console.error("Error with META.Anilist:", e);
    }

    try {
        console.log("\nTesting fallback (Gogoanime)...");
        const gogo = new ANIME.Gogoanime();
        const gogoSearch = await gogo.search("naruto");
        console.log("Gogoanime Search Results:", gogoSearch);
    } catch (e) {
        console.error("Error with Gogoanime:", e);
    }
}

test();

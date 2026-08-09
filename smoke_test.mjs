async function runTests() {
    try {
        console.log("1. /health");
        let r = await fetch("http://localhost:8000/health");
        console.log(await r.text());

        console.log("\n2. /api/search");
        r = await fetch("http://localhost:8000/api/search", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: "pool"})});
        console.log(await r.text());

        console.log("\n3. /api/match");
        r = await fetch("http://localhost:8000/api/match", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({budget: 1000000, min_beds: 1, min_baths: 1, preferred_location: "Downtown", amenities: ["pool"]})});
        console.log(await r.text());

        console.log("\n4. /api/neighborhood/Downtown");
        r = await fetch("http://localhost:8000/api/neighborhood/Downtown");
        console.log(await r.text());

        console.log("\n5. /api/investment");
        r = await fetch("http://localhost:8000/api/investment", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({property_price: 500000, monthly_rent: 2500})});
        console.log(await r.text());

        console.log("\n6. /api/reports/property/1");
        r = await fetch("http://localhost:8000/api/reports/property/1");
        console.log(await r.text());

        console.log("\n7. POST /api/favorites");
        r = await fetch("http://localhost:8000/api/favorites", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({property_id: 1})});
        console.log(await r.text());

        console.log("\n8. GET /api/user/favorites");
        r = await fetch("http://localhost:8000/api/user/favorites");
        console.log(await r.text());

    } catch (e) {
        console.error(e);
    }
}
runTests();

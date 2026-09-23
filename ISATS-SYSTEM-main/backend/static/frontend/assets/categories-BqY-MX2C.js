import{b as t}from"./index.js";async function e(){const a=await t.get("/api/categories/");return Array.isArray(a.data)?a.data:a.data.results??[]}export{e as g};

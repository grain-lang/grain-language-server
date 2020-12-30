const fs = require("fs");
const path = require("path");
const grain = require("./grain.json");

const grainType = {
  ...grain,
  name: "Grain Type",
  patterns: [
    {
      include: "#data-declarations",
    },
    {
      include: "#type",
    },
  ],
  scopeName: "source.grain-type",
};

fs.writeFileSync(
  path.join(__dirname, "grain-type.json"),
  JSON.stringify(grainType)
);

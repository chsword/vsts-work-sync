import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");

var container = $(".work-grid-container");

var gridOptions: Grids.IGridOptions = {
  height: "100%",
  width: "100%",
  source: function () {
    var result = [], i;
    for (i = 0; i < 100; i++) {
      result[result.length] = [i, "Column 2 text" + i, "Column 3 " + Math.random()];
    }

    return result;
    } (),
    columns: [
      { text: "Column 1", index: 0, width: 50 },
      { text: "Column 2", index: 1, width: 200, canSortBy: false },
      { text: "Column 3", index: 2, width: 450 }]
};

Controls.create(Grids.Grid, container, gridOptions);
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import Date_Utils = require("VSS/Utils/Date");
import Number_Utils = require("VSS/Utils/Number");
import TFS_Work_WebApi = require("TFS/Work/RestClient");
import VSS_Service = require("VSS/Service");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");

// Get an instance of the client
var client = TFS_Work_WebApi.getClient();

let webContext = VSS.getWebContext();

let project = VSS.getWebContext().project;

let projectId = project.id;
let workClient = VSS_Service.getCollectionClient(TFS_Work_WebApi.WorkHttpClient);
//let teamId = VSS.getWebContext().team.id;
//TODO: test with project
var teamContext = { projectId: webContext.project.id, teamId: webContext.team.id, project: "", team: "" };
let iterations = workClient.getTeamIterations(teamContext).then(
  (result) => {
    console.log(result);
  }
);
let witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);

let query = {
  query: "SELECT [System.Id] FROM WorkItem WHERE [System.TeamProject] = @project AND [System.State] IN ('已关闭', 'Completed', '已解决','Done') and [System.AssignedTo] = @me ORDER BY [System.ChangedDate] DESC"
};

witClient.queryByWiql(query, projectId).then(
  (result) => {
    var openWorkItems = result.workItems.map(function (wi) { return wi.id });
    console.log("resi;team",result);
    var fields = [
      "System.Title",
      "System.State",
      "Microsoft.VSTS.Common.StateChangeDate",
      "System.AssignedTo",
      "Microsoft.VSTS.Scheduling.StoryPoint"];
    witClient.getWorkItems(openWorkItems, fields).then(
      function (workItems) {
        let div = document.getElementById("projectId");
        div.textContent = 'Effort total: ' + workItems.reduce((acc, wi) => acc);
      });
  });


var container = $(".work-grid-container");

function getColumns() {
  return [
    {
      index: "region",
      text: "Region",
      width: 80
    },
    {
      index: "rep",
      text: "Representative",
      width: 80
    },
    {
      index: "orderDate",
      text: "Order Date",
      width: 100,
      getCellContents: function (
        rowInfo,
        dataIndex,
        expandedState,
        level,
        column,
        indentIndex,
        columnOrder) {

        var orderDate = this.getColumnValue(dataIndex, column.index);
        return $("<div class='grid-cell'/>")
          .width(column.width || 100)
          .text(orderDate ? Date_Utils.localeFormat(orderDate, "y") : "");
      }
    },
    {
      index: "item",
      text: "Item",
      width: 80
    },
    {
      index: "unit",
      text: "Units",
      width: 60
    },
    {
      index: "cost",
      text: "Cost",
      width: 60,
      getCellContents: function (
        rowInfo,
        dataIndex,
        expandedState,
        level,
        column,
        indentIndex,
        columnOrder) {

        var cost = this.getColumnValue(dataIndex, "cost") || 0;
        return $("<div class='grid-cell'/>")
          .width(column.width || 150)
          .text(Number_Utils.localeFormat(cost, "C"));
      }
    },
    {
      index: "total",
      text: "Total",
      width: 150,
      getCellContents: function (
        rowInfo,
        dataIndex,
        expandedState,
        level,
        column,
        indentIndex,
        columnOrder) {

        var unit = this.getColumnValue(dataIndex, "unit") || 0,
          cost = this.getColumnValue(dataIndex, "cost") || 0,
          total = unit * cost;

        return $("<div class='grid-cell total'/>")
          .css("font-weight", "bold")
          .css("font-size", "11pt")
          .css("color", total >= 300 ? "red" : "green")
          .width(column.width || 100)
          .text(Number_Utils.localeFormat((unit * cost), "C"));
      },
      comparer: function (column, order, item1, item2) {
        var total1 = (item1.unit || 0) * (item1.cost || 0),
          total2 = (item2.unit || 0) * (item2.cost || 0);

        return total1 - total2;
      }
    }
  ];
}

function getSortOder() {
  return [{ index: "orderDate", order: "asc" }];
}

function getDataSource() {
  return [
    { orderDate: new Date(2010, 0, 6), region: 'Quebec', rep: 'Jones', item: 'Pencil', unit: 95, cost: 1.99 },
    { orderDate: new Date(2010, 0, 23), region: 'Ontario', rep: 'Kivell', item: 'Binder', unit: 50, cost: 19.99 },
    { orderDate: new Date(2010, 1, 9), region: 'Ontario', rep: 'Jardine', item: 'Pencil', unit: 36, cost: 4.99 },
    { orderDate: new Date(2010, 1, 26), region: 'Ontario', rep: 'Gill', item: 'Pen', unit: 27, cost: 19.99 },
    { orderDate: new Date(2010, 2, 15), region: 'Alberta', rep: 'Sorvino', item: 'Pencil', unit: 56, cost: 2.99 },
    { orderDate: new Date(2010, 3, 1), region: 'Quebec', rep: 'Jones', item: 'Binder', unit: 60, cost: 4.99 },
    { orderDate: new Date(2010, 3, 18), region: 'Ontario', rep: 'Andrews', item: 'Pencil', unit: 75, cost: 1.99 },
    { orderDate: new Date(2010, 4, 5), region: 'Ontario', rep: 'Jardine', item: 'Pencil', unit: 90, cost: 4.99 },
    { orderDate: new Date(2010, 4, 22), region: 'Alberta', rep: 'Thompson', item: 'Pencil', unit: 32, cost: 1.99 },
    { orderDate: new Date(2010, 5, 8), region: 'Quebec', rep: 'Jones', item: 'Binder', unit: 60, cost: 8.99 },
    { orderDate: new Date(2010, 5, 25), region: 'Ontario', rep: 'Morgan', item: 'Pencil', unit: 90, cost: 4.99 },
    { orderDate: new Date(2010, 6, 12), region: 'Quebec', rep: 'Howard', item: 'Binder', unit: 29, cost: 1.99 },
    { orderDate: new Date(2010, 6, 29), region: 'Quebec', rep: 'Parent', item: 'Binder', unit: 81, cost: 19.99 }
  ];
}

var gridOptions: Grids.IGridOptions = {
  width: "100%",
  height: "100%",
  columns: getColumns(),
  sortOrder: getSortOder(),
  source: getDataSource()
};

Controls.create(Grids.Grid, container, gridOptions);
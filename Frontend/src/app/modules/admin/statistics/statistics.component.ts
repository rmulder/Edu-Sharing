import {RestAdminService} from "../../../core-module/rest/services/rest-admin.service";
import {Component, EventEmitter, Output} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {NodeStatistics, Node} from "../../../core-module/rest/data-object";
import {ListItem} from "../../../core-module/ui/list-item";
import {RestConstants} from "../../../core-module/rest/rest-constants";

// Charts.js
declare var Chart:any;

@Component({
  selector: 'app-admin-statistics',
  templateUrl: 'statistics.component.html',
  styleUrls: ['statistics.component.scss']
})
export class AdminStatisticsComponent {
  @Output() onOpenNode = new EventEmitter();
  static DEFAULT_OFFSET=1000*60*60*24*7; // 7 days
  today = new Date();
  _groupedStart = new Date(new Date().getTime()-AdminStatisticsComponent.DEFAULT_OFFSET);
  _groupedEnd = new Date();
  _nodesStart = new Date(new Date().getTime()-AdminStatisticsComponent.DEFAULT_OFFSET);
  _nodesEnd = new Date();
  _groupedMode = 'Daily';
  groupedLoading: boolean;
  groupedNoData: boolean;
  nodesNoData: boolean;
  groupedChart: any;
  nodesLoading: boolean;
  nodes: Node[];
  columns: ListItem[];
  set groupedStart(groupedStart:Date){
    this._groupedStart=groupedStart;
    this.refreshGroups();
  }
  get groupedStart(){
    return this._groupedStart;
  }
  set groupedEnd(groupedEnd:Date){
    this._groupedEnd=groupedEnd;
    this.refreshGroups();
  }
  get groupedEnd(){
    return this._groupedEnd;
  }
  set groupedMode(groupedMode:string){
    this._groupedMode=groupedMode;
    this.refreshGroups();
  }
  get groupedMode(){
    return this._groupedMode;
  }
  set nodesStart(nodesStart:Date){
    this._nodesStart=nodesStart;
    this.refreshNodes();
  }
  get nodesStart(){
    return this._nodesStart;
  }
  set nodesEnd(nodesEnd:Date){
    this._nodesEnd=nodesEnd;
    this.refreshNodes();
  }
  get nodesEnd(){
    return this._nodesEnd;
  }
    constructor(
        private admin : RestAdminService,
        private translate : TranslateService,
      ) {
      this.columns=[
          new ListItem('NODE',RestConstants.CM_NAME),
          new ListItem('NODE','counts.VIEW_MATERIAL'),
          new ListItem('NODE','counts.DOWNLOAD_MATERIAL'),
      ]
      this.refreshGroups();
      this.refreshNodes();
    }

  private refreshGroups() {
    this.groupedLoading=true;
    this.admin.getStatisticsNode(this._groupedStart,this._groupedEnd,this._groupedMode).subscribe((data)=>{
      this.groupedLoading=false;
      if(!data.length){
        this.groupedNoData=true;
        return;
      }
      this.groupedNoData=false;
      let canvas:any = document.getElementById('groupedChart');
      let ctx = canvas.getContext('2d');
      if(this.groupedChart)
        this.groupedChart.destroy();
      this.groupedChart=this.initGroupedChart(data, ctx);
      console.log(this.groupedChart);
    });
  }

  private initGroupedChart(data: NodeStatistics[], ctx:any) {
    let max=data.map((stat)=>
        Math.max(stat.counts['VIEW_MATERIAL'] ? stat.counts['VIEW_MATERIAL'] : 0,stat.counts['DOWNLOAD_MATERIAL'] ? stat.counts['DOWNLOAD_MATERIAL'] : 0)).
        reduce((a,b)=>Math.max(a,b));
    let chartGroupedData = {
      labels: data.map((stat) => stat.date),
      datasets: [{
        label: this.translate.instant('ADMIN.STATISTICS.VIEWS'),
        yAxisID: 'y-axis-view',
        backgroundColor: 'rgb(30,52,192)',
        data: data.map((stat) => stat.counts['VIEW_MATERIAL'] ? stat.counts['VIEW_MATERIAL'] : 0)
      }, {
        label: this.translate.instant('ADMIN.STATISTICS.DOWNLOADS'),
        yAxisID: 'y-axis-download',
        backgroundColor: 'rgb(40,146,192)',
        data: data.map((stat) => stat.counts['DOWNLOAD_MATERIAL'] ? stat.counts['DOWNLOAD_MATERIAL'] : 0)
      }],
    };
    Chart.defaults.global.defaultFontFamily = 'open_sansregular';
    return new Chart(ctx, {
      type: "bar",
      data: chartGroupedData,
      options: {
        responsive: true,
        aspectRatio: 3,
        legend: {
          display: true
        },
        mode: 'index',
        scales: {
          yAxes: [{
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-view',
            ticks: {
              beginAtZero: true,
              max: max
            }
          }, {
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-download',
            ticks: {
              beginAtZero: true,
              max: max
            }
          }],
        }
      }
    });
  }

  private refreshNodes() {
    this.nodes=[];
    this.nodesLoading = true;
    this.admin.getStatisticsNode(this._nodesStart, this._nodesEnd).subscribe((data) => {
      this.nodesLoading = false;
      this.nodesNoData = data.length==0;
      this.nodes = data.map((stat)=>{
        (stat.node as any).counts=stat.counts;
        return stat.node
      });
    });
  }
  openNode(node:any){
    this.onOpenNode.emit(node.node);
  }
}

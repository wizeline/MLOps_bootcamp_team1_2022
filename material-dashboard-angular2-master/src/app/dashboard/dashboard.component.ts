import { HttpClient } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import * as Chartist from "chartist";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  chart: Chartist.IChartistBarChart;
  title = "Over all Sentiment Analysis by Company";

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}
  startAnimationForBarChart(chart) {
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on("draw", function (data) {
      if (data.type === "bar") {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
      }
    });

    seq2 = 0;
  }
  ngOnInit() {
    /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

    const datawebsiteViewsChart = {
      labels: ["Positive", "Negative", "Neutral"],
      series: [[0, 0, 0]],
    };
    const optionswebsiteViewsChart = {
      axisX: {
        showGrid: false,
        showLabel: true,
      },
      low: 0,
      high: 1000,
      chartPadding: { top: 0, right: 5, bottom: 0, left: 0 },
      with: "100%",
      height: "500px",
    };
    const responsiveOptions: any[] = [
      [
        "screen and (max-width: 1000px)",
        {
          seriesBarDistance: 3,
          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            },
          },
        },
      ],
    ];
    this.chart = new Chartist.Bar(
      "#websiteViewsChart",
      datawebsiteViewsChart,
      optionswebsiteViewsChart,
      responsiveOptions
    );
    //start animation for the Emails Subscription Chart
    this.startAnimationForBarChart(this.chart);
    this.getCompanyData();
  }

  changeValues(event) {
    if (event.srcElement.value === "company") {
      this.title = "Over all Sentiment Analysis by Company";
      this.getCompanyData();
    } else if (
      event.srcElement.value in
      { Positive: true, Negative: true, Neutral: true }
    ) {
      this.topSentiments(event.srcElement.value);
      this.title = "Top 5  by sentiment :  " + event.srcElement.value;
    } else {
      this.title =
        "Over all Sentiment Analysis by User " + event.srcElement.value;
      this.getDataByUser(event.srcElement.value);
    }
  }

  getDataByUser(user: string) {
    this.http
      .get(`http://localhost:8080/api/v1/users?user=${user}`)
      .subscribe((res: any) => {
        this.updateGraph(res);
      });
  }

  getCompanyData() {
    this.http
      .get(`http://localhost:8080/api/v1/company`)
      .subscribe((res: any) => {
        console.log(res);
        const max = Math.max(
          res[2]?.Total / 1000,
          res[1]?.Total / 1000,
          res[0]?.Total / 1000
        );
        const data = {
          labels: ["Positive", "Negative", "Neutral"],
          series: [
            [res[2]?.Total / 1000, res[0]?.Total / 1000, res[1]?.Total / 1000],
          ],
        };

        const optionswebsiteViewsChart = {
          axisX: {
            showGrid: false,
            showLabel: true,
          },
          low: 0,
          high: max,
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
          height: "500px",
        };

        this.chart.update(data, optionswebsiteViewsChart);
        this.cd.detectChanges();
      });

    // const elements = document.getElementsByClassName("ct-label ct-vertical");

    // for (let i = 0; i < elements.length; i++) {
    //   elements[i].innerHTML += " K";
    // }
  }

  updateGraph(res: any) {
    const max = Math.max(
      res[2]?.["count(*)"],
      res[1]?.["count(*)"],
      res[0]?.["count(*)"]
    );
    const data = {
      labels: ["Positive", "Negative", "Neutral"],
      series: [
        [res[2]?.["count(*)"], res[0]?.["count(*)"], res[1]?.["count(*)"]],
      ],
    };

    const optionswebsiteViewsChart = {
      axisX: {
        showGrid: false,
        showLabel: true,
      },
      low: 0,
      high: max,
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
      height: "500px",
    };

    this.chart.update(data, optionswebsiteViewsChart);
    this.cd.detectChanges();
  }

  topSentiments(sentiment) {
    this.http
      .get(`http://localhost:8080/api/v1/sentiments`)
      .subscribe((res: any) => {
        const label = [];
        const series = [];

        for (const sentiments in res) {
          if (res[sentiments].Sentiment === sentiment) {
            label.push(res[sentiments].User);
            series.push(res[sentiments].Total);
          }
        }

        const max = Math.max(...series);
        const data = {
          labels: label,
          series: [series],
        };

        const optionswebsiteViewsChart = {
          axisX: {
            showGrid: false,
            showLabel: true,
          },
          low: 0,
          high: max,
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
          height: "500px",
        };

        this.chart.update(data, optionswebsiteViewsChart);
        this.cd.detectChanges();
      });
  }
}

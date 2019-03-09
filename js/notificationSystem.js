const d3 = require("d3");

class NotificationSystem extends Object {
    constructor(notificationBarSelector, bubbleSelector) {
        super();

        this.notificationBarElement = document.querySelector(notificationBarSelector);
        this.bubbleElement = document.querySelector(bubbleSelector);

        this.data = [];
        this.ind = 0;

        this.chart = d3.select(this.notificationBarElement).append("svg")
            .attr("class", "chart")
            .attr("width", "100%")
            .attr("height", "100%");
        this.chart.selectAll("circle")
            .data(this.data)

        this.notificationSVGElement = this.chart[0][0];
        this.update();
        setInterval(() => this.update(), 1000);
    }

    push(type, message) {
        let index = ++this.ind;
        this.data.push({ type, message, index })
    }

    getSVGX(d, i) {
        return (this.notificationSVGElement.clientWidth - ((this.data.length - i - 1) * 22) - 12) + "px";
    }

    update() {
        let rect = this.chart.selectAll("circle")
            .data(this.data, d => d.index);

        rect.enter().insert("circle", "line")
            .attr("cx", (d, i) => (this.notificationSVGElement.clientWidth + 50) + "px")
            .attr("cy", "50%")
            .attr("r", 10)
            .attr("class", (d, i) => "notification notification-" + d.type)
            .transition()
            .duration(1000)
            .attr("cx", (d, i) => this.getSVGX(d, i));

        rect.transition()
            .duration(1000)
            .attr("cx", (d, i) => this.getSVGX(d, i));

        rect.exit().remove();

        rect.on("mouseover", (d, i) => {
            this.bubbleElement.innerHTML = d.message;
            this.bubbleElement.classList.remove("hide");
        });
        rect.on("mouseout", (d, i) => {
            this.bubbleElement.innerHTML = '';
            this.bubbleElement.classList.add("hide");
        });

        rect.on("click", (d, i) => {
            this.data.splice(i, 1);
            this.update();
        })
    }
}

module.exports = NotificationSystem;
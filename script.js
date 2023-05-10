// Variables and functions
const dataURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
const svg  = d3.select('svg')

const drawCanvas = (height, width)=>{
    svg.attr('width', width)
    svg.attr('height', height)
}

const generateScale = (values, padding, height, width)=>{

    const heightScale = d3.scaleLinear()
                    .domain([0, d3.max(values, (item)=>item[1]
                    )])
                    .range([0, height-(2*padding)])
    const xScale = d3.scaleLinear()
                    .domain([0, values.length-1])
                    .range([padding, width - padding])                
    const datesArray = values.map((item)=> new Date(item[0]))
    
    const xAxisScale = d3.scaleTime()
                        .domain([d3.min(datesArray), d3.max(datesArray)])
                        .range(([padding, width - padding]))
    
    const yAxisScale = d3.scaleLinear()
                        .domain([0, d3.max(values, (item) => {
                            return item[1]
                        })])
                        .range([height - padding, padding ])
    return {xAxisScale, yAxisScale, heightScale, xScale}
}

const drawBars = (values, width, height, padding, heightScale, xScale)=>{
    
    let tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('visibility', 'hidden')
                    .style('width', 'auto')
                    .style('height', 'auto')

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', (width - (2*padding)) / values.length)
        .attr('data-date', (item) => {
            return item[0]
        })
        .attr('data-gdp', (item) => {
            return item[1]
        })
        .attr('height', (item) => heightScale(item[1]))
        .attr('x', (item, index) =>xScale(index))
        .attr('y', (item) => (height - padding) - heightScale(item[1]))
        .on('mouseover', function() {
            const monthValue = d3.select(this).attr('data-date').slice(5,7);
            let quarter
            switch (monthValue) {
            case "01":
            case "02":
            case "03":
                quarter = "Q1";
                break;
            case "04":
            case "05":
            case "06":
                quarter = "Q2";
                break;
            case "07":
            case "08":
            case "09":
                quarter = "Q3";
                break;
            case "10":
            case "11":
            case "12":
                quarter = "Q4";
                break;
            default:
                break;
            }
            const opciones = {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0
            };
            
            const gdp = Number(d3.select(this).attr('data-gdp'))
            const gdbformatted = gdp.toLocaleString("en-US", opciones)
            const xposition = -360 + Number(d3.select(this).attr('x'))
            const yposition = -280 + Number(d3.select(this).attr('y'))
            console.log(yposition)
            tooltip.transition().style('visibility', 'visible')
            tooltip.text(`${d3.select(this).attr('data-date').slice(0,4)} ${quarter} \n ${gdbformatted} Billion`)
            tooltip.attr('data-date', d3.select(this).attr('data-date'));
            tooltip.style('translate', `${xposition}px ${yposition}px`);
          })
        .on('mouseout', (item) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })

}
const generateAxes = ( xAxisScale, yAxisScale, height, padding)=>{
    const xAxis = d3.axisBottom(xAxisScale)
    const yAxis = d3.axisLeft(yAxisScale)
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0, ' + (height-padding) + ')')

    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ', 0)')
}

const getData = async()=>{
    try {
        const response = await fetch(dataURL)
        const json = await response.json()
        const result = json
        const data = result
        const values = data.data
        return {data, values}
    } catch (error) {
        throw new Error(e)        
    }
}

const BarChart = async()=>{
try {
    const {values} = await getData()
    const width = 900
    const height = 560
    const padding = 80
    drawCanvas(height, width)
    const {xAxisScale, yAxisScale, heightScale, xScale} = generateScale(values, padding, height, width)
    drawBars(values, width, height, padding, heightScale, xScale)
    generateAxes(xAxisScale, yAxisScale, height, padding)
} catch (error) {
    throw new Error(error)     
}
}

BarChart()
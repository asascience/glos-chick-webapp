import React, { Component } from 'react';
import Moment from 'react-moment';
import moment from 'moment'
import BootstrapTable from 'react-bootstrap-table-next';
import { Table } from 'react-bootstrap';
import GaugePlot from './GaugePlot'
import TimeSeriesPlot from './TimeSeriesPlot'
import './Home.css';



export default class StationDashboard extends Component {
    constructor(props) {
      super(props);

      this.state = {
        x: null,
        y: null,
        isLoading: true,
        data: null,
        stream: [],
        tableColumns: [],
        tableData: [],
        selected: ['ph'],
      };

      const url = 'wss://gdjcxvsub6.execute-api.us-east-2.amazonaws.com/testing';
      const connection = new WebSocket(url);

      connection.onopen = () => {
        console.log('Stream opened')
      }
      connection.onmessage = e => {
        let stream = [JSON.parse(e.data)].concat(this.state.stream);
        if (stream.length >= 5) {
          stream = stream.slice(0, 5);
        }

        // Format data for react-bootstrap-table2
        let tableColumns = [{
          dataField: 'parameter',
          text: 'Parameter',
          sort: true,
        }];
        stream.map((obj, idx) => {
          tableColumns.push({
            dataField: obj.date.toString(),
            text: moment(obj.date).format("ddd MMM DD YYYY HH:mm"),
          });
        });
        let tableData = []
        let paramRows = Object.keys(stream[0]);
        let rowObj = {};
        paramRows = paramRows.filter(item => item !== 'date' && item !== 'station');
        paramRows.map((param, idx) => {
          rowObj = {parameter: param};
          stream.map((obj, ind) => {
            rowObj[obj.date] = obj[param];
          });
          tableData.push(rowObj);
        });
        this.setState({
          tableColumns: tableColumns,
          tableData: tableData,
          stream: [JSON.parse(e.data)].concat(this.state.stream),
        })
      }
    }

    async componentDidMount() {
      if (!this.props.isAuthenticated) {
        return;
      }
      try {
          // Test API?
      } catch (e) {
        alert(e);
      }
      this.setState({ isLoading: false });
    }


    renderLander() {
      return (
        <div className="lander">
          <h1>Loading Data...</h1>
        </div>
      );
    }

    _renderGaugePlot() {
      const {stream} = this.state;
      if (stream.length === 0) {
        return null;
      }
      return (
        <div>
          <GaugePlot stream={stream}/>
        </div>
      );
    }

    _renderTimeSeriesPlot() {
      const {stream, selected} = this.state;
      if (stream.length === 0) {
        return null;
      }
      return (
        <div>
          <TimeSeriesPlot stream={stream} parameters={selected}/>
        </div>
      );
    }

    handleOnSelect = (row, isSelect) => {
      if (isSelect) {
        this.setState(() => ({
          selected: [...this.state.selected, row.parameter]
        }));
      } else {
        this.setState(() => ({
          selected: this.state.selected.filter(x => x !== row.parameter)
        }));
      }
    }

    _renderTable2() {
      const selectRow = {
        mode: 'checkbox',
        clickToSelect: true,
        selected: this.state.selected,
        onSelect: this.handleOnSelect,
      };
      return (
        <div className="container" style={{ marginTop: 50 }}>
          <BootstrapTable
            striped
            hover
            keyField='parameter'
            data={ this.state.tableData }
            columns={ this.state.tableColumns }
            selectRow={ selectRow }
          />
        </div>
      );
    }

    _renderTable() {
      const {stream} = this.state;
      if (stream.length === 0) {
        return null;
      }
      let stationName = stream[0].station;
      let params = Object.keys(stream[0]);
      params = params.filter(item => item !== 'date' && item !== 'station');
      return (
        <div>
          <h1>Station: {stationName}</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Parameter</th>
                {stream.map((obj, idx) => {
                  return <th key={obj.date}><Moment date={obj.date} format="ddd MMM DD YYYY HH:mm" /></th>
                })}
              </tr>
            </thead>
            <tbody>
            {params.map((param, idx) => {
              return (
                <tr key={idx}>
                  <td>{param}</td>
                  {stream.map((obj, ind) => {
                    return <td key={ind}>{obj[param]}</td>
                  })}
                </tr>
              )
            })}
            </tbody>
          </Table>
        </div>
      )
    }

    renderDashboard() {
      const {stream} = this.state;
      if (stream.length === 0) {
        return (
          this.renderLander()
        )
      }

      return (
        <div className="home-container">
          <div id="plot">
            {this._renderGaugePlot()}
            {this._renderTimeSeriesPlot()}
          </div>
          <div id="table">
            {this._renderTable2()}
          </div>
        </div>
      )
    }

    render() {
        // return <div className="Home">{this.props.isAuthenticated ? this.renderDashboard() : this.renderLander()}</div>;
        return <div className="Home">{this.renderDashboard()}</div>;
    }
}

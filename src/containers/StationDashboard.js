import React, { Component } from 'react';
import Moment from 'react-moment';
import moment from 'moment'
import BootstrapTable from 'react-bootstrap-table-next';
import { Table, Alert } from 'react-bootstrap';
import GaugePlot from '../components/GaugePlot'
import TimeSeriesPlot from '../components/TimeSeriesPlot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './StationDashboard.css';


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
          return tableColumns.push({
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
            return rowObj[obj.date] = obj[param];
          });
          return tableData.push(rowObj);
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
          <FontAwesomeIcon icon='spinner' size='4x' spin />
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
          <GaugePlot stream={stream} parameter='ph'/>
          <GaugePlot stream={stream} parameter='ysiturbntu'/>
        </div>
      );
    }

    _renderTimeSeriesPlot() {
      const {stream, selected} = this.state;
      if (stream.length === 0) {
        return null;
      }
      const colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"];
      return (
        <div>
          {selected.map((param, idx) => {
            return <TimeSeriesPlot stream={stream} parameters={[param]} color={colors[idx % colors.length]}/>
          })}
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

    handleOnSelectAll = (isSelect, rows) => {
      const params = rows.map(r => r.parameter);
      if (isSelect) {
        this.setState(() => ({
          selected: params
        }));
      } else {
        this.setState(() => ({
          selected: []
        }));
      }
    }

    _renderTable() {
      const selectRow = {
        mode: 'checkbox',
        clickToSelect: true,
        selected: this.state.selected,
        onSelect: this.handleOnSelect,
        onSelectAll: this.handleOnSelectAll,
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
            {this._renderTable()}
          </div>
        </div>
      )
    }

    render() {
        // return <div className="Home">{this.props.isAuthenticated ? this.renderDashboard() : this.renderLander()}</div>;
        return <div className="Home">{this.renderDashboard()}</div>;
    }
}

import React from 'react';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'


class Card extends React.Component {
  render() {
    return (<div className="card">{this.props.children}</div>)
  }
}

class SelectableCard extends React.Component {

  render() {
    let isSelected = this.props.selected ? "selected" : "";
    let className = "selectable " + isSelected;
    return (
      <Card>
        <div className={className} onClick={this.props.onClick}>
          {this.props.children}
          <div className="check"><span className="checkmark">✔</span></div>
        </div>
      </Card>
    );
  }
}

class SelectableTitleCard extends React.Component {

  render() {
    let {
      title,
      description,
      selected
    } = this.props;
    return (
      <SelectableCard onClick={this.props.onClick}
        selected={selected}>
        <div className="content">
          <h4 className="title">{title}</h4>
          <p className="description">{description}</p>
        </div>
      </SelectableCard>
    );
  }
}

class SelectableCardList extends React.Component {

  constructor(props) {
    super(props);
    let selected = props.selected;
    let initialState = {
      selected: selected
    };
    this.state = initialState;
  }

  onItemSelected(index) {
    this.setState((prevState, props) => {
      if (props.multiple) {
        let selectedIndexes = prevState.selected;
        let selectedIndex = selectedIndexes.indexOf(index);
        if (selectedIndex > -1) {
          selectedIndexes.splice(selectedIndex, 1);
          props.onChange(selectedIndexes);
        } else {
          if (!(selectedIndexes.length >= props.maxSelectable)) {
            selectedIndexes.push(index);
            props.onChange(selectedIndexes);
          }
        }
        return {
          selected: selectedIndexes
        };
      } else {
        props.onChange(index);
        return {
          selected: index
        }
      }
    });
  }

  render() {
    let {
      contents,
      multiple
    } = this.props;

    let content = contents.map((cardContent, i) => {
      var {
        title,
        description,
        selected
      } = cardContent;
      var selected = multiple ? this.state.selected.indexOf(i) > -1 : this.state.selected == i;
      return (
        <Col sm={4}>
          <SelectableTitleCard key={i}
            title={title} description={description}
            selected={selected}
            onClick={(e) => this.onItemSelected(i)} />
        </Col>
      );
    });
    return (
      <div className="cardlist">
        <Container>
          <Row>
            {content}
          </Row>
        </Container>
      </div>
    );
  }
}

class Cards extends React.Component {
  onListChanged(selected) {
    this.setState({
      selected: selected
    });
  }
  render() {
    console.log(this.props.selected)
    return (
      <div>
          <h1 className="title">{this.props.title}</h1>
          <SelectableCardList
            selected={this.props.selected}
            multiple={this.props.multiple}
            maxSelectable={this.props.maxSelectable}
            contents={this.props.cardContents}
            onChange={this.onListChanged.bind(this)}/>
      </div>);
  }
}

export default Cards
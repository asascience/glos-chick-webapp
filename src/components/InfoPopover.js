import React from 'react';
import Popover from 'react-bootstrap/Popover'
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from 'react-bootstrap';


const popover = (
  <Popover id="popover-positioned-right">
    <Popover.Content>
      This is a field monitoring station.
      These hand collected, weekly water samples
      measure toxicity due to microcystin
    </Popover.Content>
  </Popover>
);

const InfoPopover = () => (
  <OverlayTrigger trigger="click" placement="right" overlay={popover}>
    <FontAwesomeIcon icon='info-circle' style={{'marginLeft': '7px'}} />
  </OverlayTrigger>
);


export default InfoPopover;

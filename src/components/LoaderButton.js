import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './LoaderButton.css';


export default ({ isLoading, text, loadingText, className = '', disabled = false, ...props }) => (
    <Button variant='warning' className={`LoaderButton ${className}`} disabled={disabled || isLoading} {...props}>
        {isLoading && <FontAwesomeIcon icon='spinner' spin style={{'marginRight': '7px'}} />}
        {!isLoading ? text : loadingText}
    </Button>
);

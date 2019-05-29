import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './LoaderButton.css';


export default ({ isLoading, text, loadingText, className = '', disabled = false, ...props }) => (
    <Button className={`LoaderButton ${className}`} disabled={disabled || isLoading} {...props}>
        {isLoading && <FontAwesomeIcon icon='spinner' spin style={{'margin-right': '7px'}} />}
        {!isLoading ? text : loadingText}
    </Button>
);

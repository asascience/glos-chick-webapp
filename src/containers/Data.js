import React, { Component } from 'react';
import './Data.css';


export default class Data extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='Home'>
        <div className='lander'>
          <div className='jumbotron jumbotron-fluid'>
            <div className="container">
              <h1>Lake Erie Early Warning System</h1>
              <h2 style={{paddingBottom: '30px'}}>About the Data</h2>

              <p align='left'>
                Currently, the application shows these two data sources:
              </p>

              <p align='left'>
                <i><b>Real-time In-water Stations</b></i>
              </p>

              <p align='left'>
                This <a href='https://glbuoys.glos.us/erie'>network of buoys and water quality sensors</a>, called
                “sondes,” collects real-time information on a variety of parameters. Most sondes measure blue-green
                algae, turbidity, pH, dissolved oxygen, and more. Most buoys measure air temperature, wind and wave
                speed and direction, and more. Some buoy stations have a sonde mounted inside and feature a combination
                of these parameters.
              </p>

              <p align='left'>
                We partner with water treatment facilities to deploy sondes and share data. If you’re interested in
                partnering with us, reach out to <a href="mailto:support@glos.us">support@glos.us</a>.
              </p>

              <p align='left'>
                <i><b>Field Samples</b></i>
              </p>

              <p align='left'>
                Researchers at NOAA GLERL and the Cooperative Institute for Great Lakes Research
                take <a href='https://www.glerl.noaa.gov/res/HABs_and_Hypoxia/habsMonWLE.html'>weekly water samples
                </a> during HAB season throughout the western basin. They collect measurements on water quality
                parameters including bloom toxicity from microcystins, the toxic compounds most commonly associated
                with Lake Erie HABs.
              </p>

              <p align='left'>
                Below data sources will be added into the prototype soon:
              </p>

              <p align='left'>
                <i><b>HABs Forecast Model</b></i>
              </p>

              <p align='left'>
                The NOAA Great Lakes Environmental Research Laboratory <a href='https://www.glerl.noaa.gov/res/HABs_and_Hypoxia/habTracker.html'>
                Experimental Lake Erie Harmful Algal Bloom Tracker</a> is a forecast model currently in development.
                It shows where the blooms are, how big they are, and where they are likely headed in near real-time and up
                to 5 days in the future.
              </p>

              <p align='left'>
                The model is based on images taken from satellites. Once the satellites capture the image, the data is then
                processed into the cyanobacterial index, an indicator of the abundance, or biomass, of the cyanobacteria
                associated with HABs. The cyanobacterial index is converted to a cyanobacterial chlorophyll scale for use
                in the HAB Tracker, a similar indicator of cyanobacterial abundance.
              </p>

              <p align='left'>
                If you have more questions about the model, including future developments and accuracy, read more
                <a href='https://www.glerl.noaa.gov/res/HABs_and_Hypoxia/habTracker_about.html'>here</a>.
              </p>

              <p align='left'>
                <i><b>Water Currents</b></i>
              </p>

              <p align='left'>
                Water current information comes from the <a href='https://www.glerl.noaa.gov/res/glcfs/'>NOAA Great Lakes Coastal Forecasting System</a>.
                This forecast model describes lake conditions of currents, temperatures, winds, waves, ice, and more in near real-time, and also predicts up to 5 days in the future.
              </p>




            </div>
          </div>
        </div>
      </div>
    );
  }
}

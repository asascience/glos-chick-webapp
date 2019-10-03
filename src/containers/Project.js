import React, { Component } from 'react';
import './Project.css';


export default class Project extends Component {
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
              <h2 style={{paddingBottom: '30px'}}>About the Project</h2>
              <p align='left'>
                Since 2017, the <a href='https://www.glos.us/'>Great Lakes Observing System</a>&nbsp;
                has been leading a team of partners to build a <a href='https://www.glos.us/projects/habs/'>
                harmful algal bloom (HABs) early warning system</a> for western Lake Erie. These partners include
                NOAA, both <a href='https://coastalscience.noaa.gov/'>National Centers for Coastal Ocean Science
                </a> and <a href='https://www.glerl.noaa.gov/'>Great Lakes Environmental Research Laboratory</a>,&nbsp;
                <a href='https://www.limno.com/'>LimnoTech</a>, <a href='https://clevelandwateralliance.org/'>
                Cleveland Water Alliance</a>, <a href='https://www.osu.edu/'>The Ohio State University</a>,
                the <a href='https://ciglr.seas.umich.edu/'>Cooperative Institute for Great Lakes Research</a>,
                and <a href='https://www.rpsgroup.com/'>RPS Group</a>.
              </p>

              <p align='left'>
                The team is working to bring multiple sources of data from across the western
                Lake Erie basin into one place to create high-value information sent via alerts to people
                who need to make decisions during a bloom. This means integrating data from models run by NOAA,
                water quality sensors at water treatment plants, water toxicity samples, and more.
              </p>

              <p align='left'>
                As part of this effort, the team created this prototype web application as a way
                to get real-time information to water treatment managers, scientists, and other stakeholders
                wherever they are, whether they’re using a smartphone or sitting at their desktop.
              </p>

              <p align='left'>
                The application currently shows information taken from 1) in-water sensors mounted
                on buoys and water intakes, 2) toxicity measurements from weekly field monitoring, and 3) models
                from the NOAA Great Lake Environmental Research Laboratory (GLERL) that predict harmful algal blooms
                and water movement.
              </p>

              <p align='left'>
                As we continue to develop the application, it will include more data related to both
                HABs and hypoxia.
              </p>

              <p align='left'>
                Learn more about the data <a href='/data'>here</a>.
              </p>

              <p align='left'>
                This early warning system project is funded by a grant from the Ocean Technology Transition
                project from the <a href='https://ioos.noaa.gov/'>Integrated Ocean Observing System</a> (IOOS), a NOAA
                program.
              </p>

              <p align='left'>
                The project is led by <a href='https://www.glos.us/'>Great Lakes Observing System</a> (GLOS),
                a regional node of IOOS. GLOS works to coordinate the collection, sharing, and management of Great Lakes
                environmental data.
              </p>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

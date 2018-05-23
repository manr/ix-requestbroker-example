import React from 'react'
import axios from 'axios'
import { ServerRequest } from 'http';

export default class extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {};
        
        // This binding is necessary to make `this` work in the callback
        //this.refresh = this.refresh.bind(this);
    }

    /**
     * Get initial props on the server side.
     * @param {req} request
     */
    static async getInitialProps({ req }) {
        if (req) {
            return {name: ""}
        }
        else
        {
            return {name: ""}
        }
    }

    render() {
        return (
            <div>
                <div>
                    My Form
                </div>
                <div>
                    
                </div>
                <div>

                </div>
            </div>
        )
    }
}
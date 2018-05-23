import React from 'react'
import axios from 'axios'
import Link from 'next/link';

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
                    Post form request
                </div>
                <div>
                    
                </div>
                <div>
                    <Link href="/index"><a>Back</a></Link>
                </div>
            </div>
        )
    }
}
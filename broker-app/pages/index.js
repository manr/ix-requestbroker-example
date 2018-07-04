import React from 'react'
import axios from 'axios'
import Link from 'next/link';
import "../normalize.css"
import "../main.css"


export default class extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {userAgent: props.userAgent, brokerResponse: props.brokerResponse};
        
        // This binding is necessary to make `this` work in the callback
        this.refresh = this.refresh.bind(this);
    }

    /**
     * Get initial props on the server side.
     * @param {req} request
     */
    static async getInitialProps({ req }) {
        if (req) {
            const userAgent = req ? req.headers['user-agent'] : navigator.userAgent
            const response = await axios.get('http://localhost:5000/api/send/initial').catch((e) => e.response )
            const result = response.data.request_id ? response.data.result : response.data;
            return { userAgent:userAgent, brokerResponse: result }
        } else {
            return { userAgent:"", brokerResponse: "Waiting for response" }
        }
    }

    async refresh(e) {
        const response = await axios.get('http://localhost:5000/api/send/timer').catch((e) => e.response )
        const result = response.data.request_id ? response.data.result : response.data;
        console.debug(result)
        this.setState(prevState => ({
            brokerResponse: result
          }));
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.refresh(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        return (
            <div>
                <div style={{margin:10}}>
                    <h2>Broker App</h2>
                    User Agent: {this.props.userAgent}
                </div>
                <div style={{margin:10}}>
                    Request: {this.state.brokerResponse}
                </div>
                <div style={{margin:10}}>
                    <button onClick={this.refresh}>Refresh</button>
                </div>
                <div style={{margin:10}}>
                    <Link href="/form"><a>Post form</a></Link>
                </div>
            </div>
        )
    }
}
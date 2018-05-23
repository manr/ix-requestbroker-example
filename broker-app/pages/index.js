import React from 'react'
import axios from 'axios'
import Link from 'next/link';

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
            const response = await axios.get('http://localhost:5000/api/send/test1').catch((e) => e.response )
            const result = response.data.request_id ? response.data.result : response.data;
            return { userAgent:userAgent, brokerResponse: result }
        } else {
            return { userAgent:"N/A", brokerResponse: "No response" }
        }
    }

    async refresh(e) {
        const response = await axios.get('http://localhost:5000/api/send/test1').catch((e) => e.response )
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
                <div>
                    Hello World {this.props.userAgent}
                </div>
                <div>
                    {this.state.brokerResponse}
                </div>
                <div>
                    <button onClick={this.refresh}>Refresh</button>
                </div>
                <div>
                    <Link href="/form"><a>Go to form</a></Link>
                </div>
            </div>
        )
    }
}
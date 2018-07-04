import React from 'react'
import axios from 'axios'
import Link from 'next/link';

export default class extends React.Component {

    constructor(props) {
        super(props);

        this.state = {msg: "", description: "", result: ""};

        // This binding is necessary to make `this` work in the callback
        this.handleChange = this.handleChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    /**
     * Get initial props on the server side.
     * @param {req} request
     */
    static async getInitialProps({ req }) {
        if (req) {
            return {msg: "", description: "", result: ""};
        }
        else
        {
            return {msg: "", description: "", result: ""};
        }
    }

    handleChange(event) {
        if (!event)
            return;

        const value = event.target.value;
        
        if (event.target.name === 'tfMsg')
            this.setState(prevState => ({
                msg: value
            }));
        else
            this.setState(prevState => ({
                description: value
            }));
    }

    async submitForm(event) {
        event.preventDefault();

        this.setState(prevState => ({
            result: ""
        }));

        const response = await axios.get('http://localhost:5000/api/send/' + this.state.msg)
                                    .catch((e) => e.message)

        const result = (response.data && response.data.request_id) ? response.data.result : response;
        
        this.setState(prevState => ({
            msg: "",
            description: "",
            result: result
        }));
    }

    
    render() {
        return (
            <div>
                <div>
                    <h2>Post form request</h2>
                </div>
                <form onSubmit={this.submitForm}>
                    <div>
                        <label>
                            Message:
                            <input type="text" name="tfMsg" value={this.state.msg} onChange={this.handleChange}/>
                        </label>
                    </div>
                    <div>
                        Result: {this.state.result}
                    </div>
                    <div>
                        <input type="submit" value="Submit" />
                    </div>
                    <div>
                        <Link href="/index"><a>Back</a></Link>
                    </div>
                </form>
            </div>
        )
    }
}
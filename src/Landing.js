import React from 'react';
import Button from '@material-ui/core/Button';

export default class Landing extends React.Component {
    render() {
        if (this.props.waiting) {
            return <div>
                Waiting
            </div>
        }
        return <div>
            <Button className="blackbutton" variant="contained" color="primary"   onClick={e => this.props.onClick(e, "black")}> <font size="100"> Black </font>  </Button>
            <Button className="whitebutton" variant="contained" color="secondary" onClick={e => this.props.onClick(e, "white")}> <font size="100"> White </font>  </Button>
        </div>
    }
}
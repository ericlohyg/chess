import React from 'react'

export default class Tile extends React.Component {

    render() {
        var i;
        if (this.props.chesspiece != null) {
            i = <img onClick={(e) => this.props.onClick(e, this.props.i, this.props.j)} src={require(`./image/${this.props.chesspiece}`)} alt="fail" />;
        } else {
            i = <div onClick={(e) => this.props.onClick(e, this.props.i, this.props.j)} style={{width: '100%', height:'100%'}}></div>
        }

        return <div className={`tile ${this.props.tilestate}`}>
            {i}
        </div>;
    }
}
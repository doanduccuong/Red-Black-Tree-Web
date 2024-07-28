import React, { Component } from 'react';
import Tree from 'react-d3-tree';
import './App.css';

const containerStyles = {
    width: '100%',
    height: '100vh',
}

const nullNode = 'NIL'

const redColor = {
    shapeProps: {
        shape: 'circle',
        r: 11,
        fill: 'red',
        stroke: 'white',
    }
}

const blackColor = {
    shapeProps: {
        shape: 'circle',
        r: 11,
        fill: 'black',
        stroke: 'white',
    }
}

const yellowColor = {
    shapeProps: {
        shape: 'circle',
        r: 11,
        fill: 'yellow',
        stroke: 'green',
    }
}

class App extends Component {
    state = {
        input1: '',
        input2: '',
        myTreeData: [{ name: nullNode, nodeSvgShape: blackColor }],
        forceMount: true,
        searchPath: ''
    }

    componentDidMount() {
        const dimensions = this.treeContainer.getBoundingClientRect();
        this.setState({
            translate: {
                x: dimensions.width / 2,
                y: dimensions.height / 7
            }
        });
    }

    leftRotate = (tree, currentNode) => {
        var temp = currentNode.children[1];
        currentNode.children[1] = temp.children[0];
        if (temp.children[0].name != nullNode) {
            temp.children[0].parent = currentNode;
        }
        temp.parent = currentNode.parent;
        if (currentNode.parent === null) {
            tree[0] = temp;
        } else if (currentNode === currentNode.parent.children[0]) {
            currentNode.parent.children[0] = temp;
        } else {
            currentNode.parent.children[1] = temp;
        }
        temp.children[0] = currentNode;
        currentNode.parent = temp;
    }

    rightRotate = (tree, currentNode) => {
        var temp = currentNode.children[0];
        currentNode.children[0] = temp.children[1];
        if (temp.children[1].name != nullNode) {
            temp.children[1].parent = currentNode;
        }
        temp.parent = currentNode.parent;
        if (currentNode.parent === null) {
            tree[0] = temp;
        } else if (currentNode === currentNode.parent.children[1]) {
            currentNode.parent.children[1] = temp;
        } else {
            currentNode.parent.children[0] = temp;
        }
        temp.children[1] = currentNode;
        currentNode.parent = temp;
    }

    insertNode = () => {
        if (this.state.input1 !== '') {
            let value = this.state.input1;
            console.log('Value entered = ' + value);
            let tree = this.state.myTreeData;
            if (tree[0].name === nullNode) {
                tree = [{
                    name: value,
                    nodeSvgShape: blackColor,
                    children: [{ name: nullNode, nodeSvgShape: blackColor }, { name: nullNode, nodeSvgShape: blackColor }],
                    parent: null
                }];
            } else {
                var currentNode = tree[0];
                var parentNode = null;
                var grandParentNode = null;
                var isValueFound = false;

                while (currentNode.name !== nullNode) {
                    grandParentNode = parentNode;
                    parentNode = currentNode;
                    if (parseInt(value) > parseInt(currentNode.name)) {
                        currentNode = currentNode.children[1];
                    } else if (parseInt(value) < parseInt(currentNode.name)) {
                        currentNode = currentNode.children[0];
                    } else {
                        isValueFound = true;
                        break;
                    }
                }

                if (!isValueFound) {
                    let newNode = {
                        name: value,
                        nodeSvgShape: redColor,
                        children: [{ name: nullNode, nodeSvgShape: blackColor }, { name: nullNode, nodeSvgShape: blackColor }],
                        parent: parentNode
                    };
                    if (parseInt(value) < parseInt(parentNode.name)) {
                        parentNode.children[0] = newNode;
                    } else {
                        parentNode.children[1] = newNode;
                    }
                    currentNode = newNode;

                    while (parentNode.nodeSvgShape === redColor) {
                        if (parentNode === grandParentNode.children[0]) {
                            var uncleNode = grandParentNode.children[1];
                            if (uncleNode.nodeSvgShape === redColor) {
                                parentNode.nodeSvgShape = blackColor;
                                uncleNode.nodeSvgShape = blackColor;
                                grandParentNode.nodeSvgShape = redColor;
                                currentNode = grandParentNode;
                            } else {
                                if (currentNode === parentNode.children[1]) {
                                    currentNode = parentNode;
                                    this.leftRotate(tree, currentNode);
                                    parentNode = currentNode.parent;
                                }
                                parentNode.nodeSvgShape = blackColor;
                                grandParentNode.nodeSvgShape = redColor;
                                this.rightRotate(tree, grandParentNode);
                            }
                        } else {
                            var uncleNode = grandParentNode.children[0];
                            if (uncleNode.nodeSvgShape === redColor) {
                                parentNode.nodeSvgShape = blackColor;
                                uncleNode.nodeSvgShape = blackColor;
                                grandParentNode.nodeSvgShape = redColor;
                                currentNode = grandParentNode;
                            } else {
                                if (currentNode === parentNode.children[0]) {
                                    currentNode = parentNode;
                                    this.rightRotate(tree, currentNode);
                                    parentNode = currentNode.parent;
                                }
                                parentNode.nodeSvgShape = blackColor;
                                grandParentNode.nodeSvgShape = redColor;
                                this.leftRotate(tree, grandParentNode);
                            }
                        }
                    }
                    tree[0].nodeSvgShape = blackColor;
                }
            }
            this.setState({
                input1: '',
                myTreeData: tree,
                forceMount: !this.state.forceMount
            });
        }
    }

    searchNode = () => {
        if (this.state.input2 !== '') {
            var value = parseInt(this.state.input2, 10);
            var tmp = this.state.myTreeData;
            var currentNode = tmp[0];
            var route = '';
            var isFound = false;
            while (currentNode.name !== nullNode) {
                route += currentNode.name + ', ';
                console.log(currentNode.name);
                currentNode.nodeSvgShape = yellowColor;
                this.setState({
                    myTreeData: tmp,
                    forceMount: !this.state.forceMount,
                });
                if (parseInt(currentNode.name) === value) {
                    isFound = true;
                    break;
                } else if (parseInt(currentNode.name) > value) {
                    currentNode = currentNode.children[0];
                } else {
                    currentNode = currentNode.children[1];
                }
            }
            if (!isFound) {
                alert('Value not found!');
            }
            if (route[route.length - 2] === ',') {
                route = route.substring(0, route.length - 2);
            }
            this.setState({
                input2: '',
                searchPath: route
            });
        }
    }

    handleInputChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    }

    render() {
        return (
            <div style={containerStyles} ref={tc => (this.treeContainer = tc)}>
                <div style={{ marginTop: -15, height: 61, backgroundColor: "#006633" }}>
                    <h1 style={{ paddingLeft: 10, paddingTop: 10, marginTop: 15, color: "#ffCC33" }}>Red-Black Tree Visualization</h1>
                </div>
                <br />
                <input style={{ marginLeft: 15 }} type="text" placeholder="Enter a value to be added" value={this.state.input1} onChange={this.handleInputChange('input1')} />
                <button onClick={() => this.insertNode()}>Insert</button>

                <input style={{ marginLeft: 31 }} type="text" placeholder="Enter a value to search for" value={this.state.input2} onChange={this.handleInputChange('input2')} />
                <button onClick={() => this.searchNode()}>Search</button>
                <br />
                {
                    this.state.searchPath !== '' &&
                    <div>
                        <br />
                        <label style={{ marginLeft: 20 }}>Search path is: {this.state.searchPath}</label>
                    </div>
                }
                <Tree
                    data={this.state.myTreeData}
                    orientation={"vertical"}
                    translate={this.state.translate}
                    collapsible={false}
                    depthFactor={60}
                    key={this.state.forceMount}
                />
            </div>
        );
    }
}

export default App;

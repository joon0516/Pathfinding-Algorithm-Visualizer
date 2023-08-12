import React, { Component } from "react";
import Node from "./Node/Node";
import { Dijkstra } from "../algorithms/dijkstra";
import { A_Star } from "../algorithms/a*";
import { GreedyBFS } from "../algorithms/greedyBFS";
import { BFS } from "../algorithms/bfs";
import { DFS } from "../algorithms/dfs";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { AiFillGithub, AiFillLinkedin, AiOutlineMail } from "react-icons/ai";

import "./pathfindingVisualizer.css";

const rowSize = 25;
const colSize = 40;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      START_NODE_ROW: 12,
      START_NODE_COL: 10,
      END_NODE_ROW: 12,
      END_NODE_COL: 30,
      mouseIsPressed: false,
      isRunnig: false,
      isStartNode: false,
      isEndNode: false,
      currentRow: 0,
      currentCol: 0,
      description: "Welcome to my pathfinding algorithm visualizer!",
      link: "",
    };
  }

  componentDidMount() {
    const grid = this.getInitialGrid();
    this.setState({ grid });
  }

  //creating initial grid
  getInitialGrid() {
    const grid = [];
    for (let row = 0; row < rowSize; row++) {
      const currentRow = [];
      for (let col = 0; col < colSize; col++) {
        currentRow.push(this.createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
  }

  createNode(col, row) {
    return {
      col,
      row,
      isStart:
        row === this.state.START_NODE_ROW && col === this.state.START_NODE_COL,
      isEnd: row === this.state.END_NODE_ROW && col === this.state.END_NODE_COL,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  }

  //Cleaning grid
  cleanGrid() {
    if (this.state.isRunnig) {
      return;
    }
    this.setState({ grid: this.getInitialGrid() });
    for (let row = 0; row < rowSize; row++) {
      for (let col = 0; col < colSize; col++) {
        document.getElementById(`node-${row}-${col}`).className = "node";
      }
    }
    document.getElementById(
      `node-${this.state.START_NODE_ROW}-${this.state.START_NODE_COL}`
    ).className = "node node-start";
    document.getElementById(
      `node-${this.state.END_NODE_ROW}-${this.state.END_NODE_COL}`
    ).className = "node node-end";
  }

  cleanGridButWalls() {
    if (this.state.isRunnig) {
      return;
    }
    for (const row of this.state.grid) {
      for (const node of row) {
        const className = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;
        if (
          className !== "node node-start" &&
          className !== "node node-end" &&
          className !== "node node-wall"
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node";
          node.isStart = false;
          node.isEnd = false;
          node.distance = Infinity;
          node.isVisited = false;
          node.isWall = false;
          node.previousNode = null;
        } else if (className === "node node-start") {
          node.isStart = true;
          node.isEnd = false;
          node.distance = Infinity;
          node.isVisited = false;
          node.isWall = false;
          node.previousNode = null;
        } else if (className === "node node-end") {
          node.isStart = false;
          node.isEnd = true;
          node.distance = Infinity;
          node.isVisited = false;
          node.isWall = false;
          node.previousNode = null;
        }
      }
    }
  }

  isGridClean() {
    for (let row = 0; row < rowSize; row++) {
      for (let col = 0; col < colSize; col++) {
        const className = document.getElementById(
          `node-${row}-${col}`
        ).className;
        if (
          className === "node node-visited" ||
          className === "node node-shortest-path"
        ) {
          return false;
        }
      }
    }
    return true;
  }

  //clicking
  handleMouseDown(row, col) {
    if (this.state.isRunnig) {
      return;
    }

    if (!this.isGridClean()) {
      this.cleanGridButWalls();
      return;
    }

    const className = document.getElementById(`node-${row}-${col}`).className;
    if (className === "node node-start") {
      this.setState({
        mouseIsPressed: true,
        isStartNode: true,
        currentRow: row,
        currentCol: col,
      });
    } else if (className === "node node-end") {
      this.setState({
        mouseIsPressed: true,
        isEndNode: true,
        currentRow: row,
        currentCol: col,
      });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed || this.state.isRunnig) {
      return;
    }

    const className = document.getElementById(`node-${row}-${col}`).className;
    if (this.state.isStartNode) {
      if (className !== "node node-wall") {
        // eslint-disable-next-line
        this.state.grid[this.state.currentRow][
          this.state.currentCol
        ].isStart = false;

        document.getElementById(
          `node-${this.state.currentRow}-${this.state.currentCol}`
        ).className = "node";

        this.setState({ currentRow: row, currentCol: col });
        // eslint-disable-next-line
        this.state.grid[row][col].isStart = true;
        document.getElementById(`node-${row}-${col}`).className =
          "node node-start";
      }
      this.setState({ START_NODE_ROW: row, START_NODE_COL: col });
    } else if (this.state.isEndNode) {
      if (className !== "node node-wall") {
        // eslint-disable-next-line
        this.state.grid[this.state.currentRow][
          this.state.currentCol
        ].isEnd = false;
        document.getElementById(
          `node-${this.state.currentRow}-${this.state.currentCol}`
        ).className = "node";

        this.setState({ currentRow: row, currentCol: col });
        // eslint-disable-next-line
        this.state.grid[row][col].isEnd = true;
        document.getElementById(`node-${row}-${col}`).className =
          "node node-end";
      }
      this.setState({ END_NODE_ROW: row, END_NODE_COL: col });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
  }

  handleMouseUp() {
    if (this.state.isRunnig) {
      return;
    }

    if (this.state.isStartNode) {
      this.setState({
        isStartNode: !this.state.isStartNode,
        START_NODE_ROW: this.state.currentRow,
        START_NODE_COL: this.state.currentCol,
      });
    } else if (this.state.isEndNode) {
      this.setState({
        isEndNode: !this.state.isEndNode,
        END_NODE_ROW: this.state.currentRow,
        END_NODE_COL: this.state.currentCol,
      });
    }
    this.setState({ mouseIsPressed: false });
  }

  //Pathfinding algorithm
  visualizeAlgorithm(algorithm) {
    if (this.state.isRunnig) {
      return;
    }
    if (false) {
      alert("Will be implmented soon...");
      return;
    }
    this.cleanGridButWalls();

    const { grid } = this.state;
    const startNode =
      grid[this.state.START_NODE_ROW][this.state.START_NODE_COL];
    const endNode = grid[this.state.END_NODE_ROW][this.state.END_NODE_COL];
    let visitedNodesInOrder;

    this.setState({ isRunnig: true });

    if (algorithm === "Dijkstra") {
      visitedNodesInOrder = Dijkstra(grid, startNode, endNode);
    } else if (algorithm === "A*") {
      visitedNodesInOrder = A_Star(grid, startNode, endNode);
    } else if (algorithm === "GreedyBFS") {
      visitedNodesInOrder = GreedyBFS(grid, startNode, endNode);
    } else if (algorithm === "BFS") {
      visitedNodesInOrder = BFS(grid, startNode, endNode);
    } else if (algorithm === "DFS") {
      visitedNodesInOrder = DFS(grid, startNode, endNode);
    }

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const className = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;
        if (className !== "node node-start" && className !== "node node-end") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
        }
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      if (i === nodesInShortestPathOrder.length - 1) {
        setTimeout(() => {
          this.setState({ isRunnig: false });
        }, 60 * i);
      }
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const className = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;
        if (className !== "node node-start" && className !== "node node-end") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-shortest-path";
        }
      }, 50 * i);
    }
  }

  handleChange = (event) => {
    let link, des;
    if (event.target.value === "Dijkstra") {
      link = (
        <a
          href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dijkstra's Algorithm
        </a>
      );
      des =
        "is a graph search algorithm that finds the shortest path in a weighted graph.";
    } else if (event.target.value === "A*") {
      link = (
        <a
          href="https://en.wikipedia.org/wiki/A*_search_algorithm"
          target="_blank"
          rel="noopener noreferrer"
        >
          A* search algorithm
        </a>
      );
      des = "optimizes by searching for shorter paths first.";
    } else if (event.target.value === "GreedyBFS") {
      link = (
        <a
          href="https://en.wikipedia.org/wiki/Best-first_search#Greedy_BFS"
          target="_blank"
          rel="noopener noreferrer"
        >
          Greedy best-first search
        </a>
      );
      des = "finds the most promising path regardless of whether they are the shortest.";
    } else if (event.target.value === "BFS") {
      link = (
        <a
          href="https://en.wikipedia.org/wiki/Breadth-first_search"
          target="_blank"
          rel="noopener noreferrer"
        >
          Breadth-first search (BFS)
        </a>
      );
      des = "expores a graph by level to find the shortest path.";
    } else if (event.target.value === "DFS") {
      link = (
        <a
          href="https://en.wikipedia.org/wiki/Depth-first_search"
          target="_blank"
          rel="noopener noreferrer"
        >
          Depth-first search (DFS)
        </a>
      );
      des = "expores a graph as far as possible before backtracking.";
    }
    this.setState({
      description: des,
      link: link,
    });
  };

  render() {
    const { grid } = this.state;

    return (
      <>
        <div className="d-flex justify-content-center mt-3">
          <h3>Pathfinding Algorithm Visualizer</h3>
        </div>
        <div className="d-flex justify-content-center">
          <div className="mx-2 my-2">
            <Form.Select
              aria-label="Default select example"
              id="dropdown"
              onChange={this.handleChange}
            >
              {/* <option>Open this select menu</option> */}
              <option value="Dijkstra">Dijkstra</option>
              <option value="A*">A*</option>
              <option value="GreedyBFS">Greedy BFS</option>
              <option value="BFS">BFS</option>
              <option value="DFS">DFS</option>
            </Form.Select>
          </div>
          <Button
            className="mx-2 my-2"
            variant="primary"
            onClick={() =>
              this.visualizeAlgorithm(
                `${document.getElementById("dropdown").value}`
              )
            }
          >
            Visualize
          </Button>
          <Button
            className="mx-2 my-2"
            variant="secondary"
            onClick={() => this.cleanGrid()}
          >
            Reset
          </Button>
        </div>
        <div className="d-flex justify-content-center">
          <p id="algo-description">
            {this.state.link} {this.state.description}
          </p>
        </div>
        <table className="grid-container">
          <tbody className="grid">
            {grid.map((row, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  {row.map((node, nodeIndex) => {
                    return (
                      <Node
                        key={nodeIndex}
                        row={node.row}
                        col={node.col}
                        isWall={node.isWall}
                        isStart={node.isStart}
                        isEnd={node.isEnd}
                        onMouseDown={(row, col) =>
                          this.handleMouseDown(row, col)
                        }
                        onMouseEnter={(row, col) =>
                          this.handleMouseEnter(row, col)
                        }
                        onMouseUp={() => this.handleMouseUp()}
                      ></Node>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <div className="d-flex justify-content-between mt-1">
            <p>Created by Joonhyuk Ko.</p>
            <div className="d-flex">
              <a className="mx-1" href="https://github.com/joon0516">
                <AiFillGithub style={{ fontSize: "27", color: "#1c1c1e" }} />
              </a>
              <a
                className="mx-1"
                href="https://www.linkedin.com/in/joonhyuk-ko"
              >
                <AiFillLinkedin style={{ fontSize: "27", color: "#1c1c1e" }} />
              </a>
              <a className="mx-1" href="mailto:tah3af@virginia.edu">
                <AiOutlineMail style={{ fontSize: "27", color: "#1c1c1e" }} />
              </a>
            </div>
          </div>
        </table>
      </>
    );
  }
}

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

function getNodesInShortestPathOrder(endNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

export function GreedyBFS(grid, startNode, endNode) {
  if (!startNode || !endNode || startNode === endNode) {
    return false;
  }

  const unvisitedNodes = [];
  const visitedNodesInOrder = [];

  startNode.distance = 0;
  unvisitedNodes.push(startNode);

  while (unvisitedNodes.length !== 0) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.isWall) {
      continue;
    }

    if (closestNode.distance === Infinity) {
      return visitedNodesInOrder;
    }

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === endNode) {
      return visitedNodesInOrder;
    }

    const neighbors = getNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      const distance = closestNode.distance + 1;

      if (neighborNotInUnvisitedNode(neighbor, unvisitedNodes)) {
        unvisitedNodes.unshift(neighbor);
        neighbor.distance = distance;
        neighbor.totalDistance = manhattenDistance(neighbor, endNode);
        neighbor.previousNode = closestNode;
      } else if (distance < neighbor.distance) {
        neighbor.distance = distance;
        neighbor.totalDistance = manhattenDistance(neighbor, endNode);
        neighbor.previousNode = closestNode;
      }
    }
  }
  return visitedNodesInOrder;
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => {
    return nodeA.totalDistance - nodeB.totalDistance;
  });
}

function getNeighbors(node, grid) {
  let neighbors = [];
  const { row, col } = node;

  if (row > 0) {
    neighbors.push(grid[row - 1][col]);
  }
  if (row < grid.length - 1) {
    neighbors.push(grid[row + 1][col]);
  }
  if (col > 0) {
    neighbors.push(grid[row][col - 1]);
  }
  if (col < grid[0].length - 1) {
    neighbors.push(grid[row][col + 1]);
  }

  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

function neighborNotInUnvisitedNode(neighbor, unvisitedNodes) {
  for (const node of unvisitedNodes) {
    if (node.row === neighbor.row && node.col === neighbor.col) {
      return false;
    }
  }
  return true;
}

function manhattenDistance(node, endNode) {
  return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
}

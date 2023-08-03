export function A_Star(grid, startNode, endNode) {
  if (!startNode || !endNode || startNode === endNode) {
    return false;
  }

  let openList = [];
  let closedList = [];

  startNode.totalCost = 0;
  startNode.distance = 0;
  startNode.heuristic = 0;

  openList.push(startNode);

  while (openList.length !== 0) {
    let currNode = leastTotalCostNode(openList);
    openList = removeFromList(currNode, openList);

    if (currNode.isWall) {
      continue;
    }

    if (currNode.distance === Infinity) {
      return closedList;
    }

    currNode.isVisited = true;
    closedList.push(currNode);

    if (currNode === endNode) {
      return closedList;
    }

    updateNeighbors(currNode, grid, endNode, openList, closedList);
  }
  return closedList;
}

function leastTotalCostNode(openList) {
  let least;
  let index;

  for (let i = 0; i < openList.length; i++) {
    if (!least || least.totalCost > openList[i].totalCost) {
      least = openList[i];
      index = i;
    } else if (
      least.totalCost === openList[i].totalCost &&
      least.heuristic > openList[i].heuristic
    ) {
      least = openList[i];
      index = i;
    }
  }

  openList.splice(index, 1);
  return least;
}

function removeFromList(node, list) {
  let newList = [];
  for (let i = 0; i < list.length; i++) {
    if (node === list[i]) continue;
    newList.push(list[i]);
  }
  return newList;
}

function updateNeighbors(node, grid, endNode, openList, closedList) {
  let neighbors = getNeighbors(node, grid);

  for (let neighbor of neighbors) {
    if (closedList.includes(neighbor)) {
      continue;
    }

    let temp = node.distance + 1;
    let newPath = false;

    if (openList.includes(neighbor)) {
      if (temp < neighbor.distance) {
        neighbor.distance = temp;
        newPath = true;
      }
      openList.push(neighbor);
    } else {
      neighbor.distance = temp;
      openList.push(neighbor);
      newPath = true;
    }

    if (newPath) {
      neighbor.heuristic = manhattenDistance(neighbor, endNode);
      neighbor.totalCost = neighbor.distance + neighbor.heuristic;
      neighbor.previousNode = node;
    }
  }
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

function manhattenDistance(node, endNode) {
  return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
}

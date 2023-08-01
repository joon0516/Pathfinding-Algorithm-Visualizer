export function DFS(grid, startNode, endNode) {
  if (!startNode || !endNode || startNode === endNode) {
    return false;
  }

  const visitedNodesInOrder = [];
  let stack = [];
  stack.push(startNode);

  while (stack.length !== 0) {
    const currNode = stack.pop();

    if (currNode === endNode) {
      return visitedNodesInOrder;
    }

    if (currNode.isWall || (!currNode.isStart && currNode.isVisited)) {
      continue;
    }

    currNode.isVisited = true;
    visitedNodesInOrder.push(currNode);

    const { row, col } = currNode;
    let nextNode;
    if (col > 0) {
      nextNode = grid[row][col - 1];
      if (!nextNode.isVisited) {
        stack.push(nextNode);
        nextNode.previousNode = currNode;
      }
    }
    if (row < grid.length - 1) {
      nextNode = grid[row + 1][col];
      if (!nextNode.isVisited) {
        stack.push(nextNode);
        nextNode.previousNode = currNode;
      }
    }
    if (col < grid[0].length - 1) {
      nextNode = grid[row][col + 1];
      if (!nextNode.isVisited) {
        stack.push(nextNode);
        nextNode.previousNode = currNode;
      }
    }
    if (row > 0) {
      nextNode = grid[row - 1][col];
      if (!nextNode.isVisited) {
        stack.push(nextNode);
        nextNode.previousNode = currNode;
      }
    }
  }
}
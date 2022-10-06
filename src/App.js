import { useState, useEffect } from 'react';
import './App.css';

let size = 60;
let numBombs = 300;
function App() {
  const [tiles, setTiles] = useState([]);
  const [isFlagging, setIsFlagging] = useState(false);
  const [isGameOver, setGameOver] = useState(false);
  const [userWon, setUserWon] = useState(false);
  useEffect(() => {
    let unprovoked = 0;
    let userLost = false;
    tiles.forEach(tile => {
      if (tile.isFlagged || !tile.isToggled)
      {
        unprovoked += 1;
      }
      if (tile.isBomb && tile.isToggled)
      {
        userLost = true;
      }
    })
    if (userLost)
    {
      setUserWon(false);
    }
    else if (unprovoked == numBombs)
    {
      console.log("you won!!!!")
      setUserWon(true);
      setGameOver(true);
    }
    
      
  }, [tiles])
  if (tiles.length === 0)
  {
    populateTiles(setTiles);
  }
  let tileSize = 700 / size
  const boardStyle = {
    display:"grid",
    gridTemplateColumns: `${`${tileSize}px `.repeat(size)}`,
    gridTemplateRows: `${`${tileSize}px `.repeat(size)}`,
    fontSize: `${tileSize / 2}px`
  }
  let flagBtnText = "Flagging: Off"
  if (isFlagging)
  {
    flagBtnText = "Flagging: On"
  }
  let gameOverText = null;
  let restartBtn = null;
  if (isGameOver)
  {
    if (userWon)
    {
      gameOverText = <h1>You win!</h1>
    }
    else
    {
      gameOverText = <h1>Game Over!</h1>
    }
    restartBtn = <button className='restart' onClick={() => {
      setIsFlagging(false);
      setGameOver(false);
      populateTiles(setTiles);
      }}>Restart</button>
  }
  
  return (
    <div className="App">
      <h1>Minesweeper</h1>
      <div className="board" style={boardStyle}>
        {renderTiles(tiles, setTiles, isFlagging, isGameOver, setGameOver)}
      </div>
      
      <div className="buttons">
        <button className="toggleflag" onClick={() => {toggleFlag(isFlagging, setIsFlagging)}}>{flagBtnText}</button>
        {restartBtn}
      </div>
      {gameOverText}
      
    </div>
  );
}
function toggleFlag(isFlagging, setIsFlagging)
{
  setIsFlagging(!isFlagging)
}
function populateTiles(setTiles)
{
  let bombLocations = []
  while (bombLocations.length < numBombs)
  {
    let location = Math.floor(Math.random() * size * size)
    if (!bombLocations.includes(location))
    {
      bombLocations.push(location)
    }
  }
  const dummyTiles = [];
  for (let i = 0; i < size * size; i++)
  {
    let x = i % size;
    let y = Math.floor(i / size);
    let isBomb = false
    if (bombLocations.includes(i))
    {
      isBomb = true
    }
      dummyTiles.push({x: x, y: y, isToggled: false, isFlagged: false, key: i, isBomb: isBomb, bombsAround: -1});
  }
  setTiles(dummyTiles);
}

function renderTiles(tiles, setTiles, isFlagging, isGameOver, setGameOver)
{
  return tiles.map(tile => {
    let thisClass = "tile"
    let bombsAround = ""
    if (tile.isToggled)
    {
      thisClass += " highlighted";
      bombsAround += tile.bombsAround;
      if (tile.isFlagged)
      {
        bombsAround = "F"
      }
      else if (tile.isBomb)
      {
        bombsAround = "B"
      }
      else if (bombsAround === "0")
      {
        bombsAround = ""
      }
    }
    if (tile.isFlagged)
    {
      thisClass += " flagged"
    }
    else if (tile.isBomb && tile.isToggled)
    {
      thisClass += " clickedBomb"
    }
    
    return (<div className={thisClass} key={tile.key} onClick={() => clickTile(tiles, setTiles, tile, isFlagging, isGameOver, setGameOver)}>{bombsAround}</div>);
  });
}

function clickTile(tiles, setTiles, targetTile, isFlagging, isGameOver, setGameOver)
{
    if (isGameOver)
    {
      return;
    }
    if (targetTile.isToggled && !(targetTile.isFlagged && isFlagging))
    {
      return;
    }
    const checked = [];
    const toggledData = new Map();
    if (!isFlagging)
    {
      if (targetTile.isBomb)
      {
        setGameOver(true);
        checked.push(targetTile.key)
        toggledData.set(targetTile.key, -1)
      }
      else
      {
        getTileNeighbors(tiles, targetTile, checked, toggledData);
      }
    }
    else
    {
      checked.push(targetTile.key)
    }
    
    let newTiles = [];
    tiles.forEach(tile => 
      {
        let isToggled = tile.isToggled;
        let bombsAround = tile.bombsAround;
        let isFlagged = tile.isFlagged
        if (targetTile.key === tile.key && isFlagging)
        {
          isToggled = true;
          isFlagged = true;
          if (tile.isFlagged)
          {
            isFlagged = false;
            isToggled = false;
          }
        }
        else if (checked.includes(tile.key))
        {
          isToggled = true;
          bombsAround = toggledData.get(tile.key)
        }
        
        newTiles.push({x: tile.x, y: tile.y, isToggled: isToggled, isFlagged: isFlagged, key: tile.key, isBomb: tile.isBomb, bombsAround: bombsAround})
      })
    setTiles(newTiles);

}
function getTileNeighbors(tiles, targetTile, checked, toggledData)
{
  if (targetTile.isToggled)
  {
    return;
  }
  if (checked.includes(targetTile.key))
  {
    return;
  }
  checked.push(targetTile.key);
  let x = targetTile.x;
  let y = targetTile.y;
  let highlighted = []
  let bombsAround = 0
  for (let targetX = x - 1; targetX <= x + 1; ++targetX)
  {
    for (let targetY = y - 1; targetY <= y + 1; ++targetY)
    {
      if (targetX >= 0 && targetX < size && targetY >= 0 && targetY < size && (targetX !== x || targetY !== y))
      {
        highlighted.push((targetY * size) + targetX);
      }
    }
  }
  let surrounding = [];
  tiles.forEach(tile => {
    if (highlighted.includes(parseInt(tile.key)))
    {
      surrounding.push(tile);
      if (tile.isBomb)
      {
        bombsAround += 1
      }
    }
  });
  toggledData.set(targetTile.key, bombsAround)
  if (bombsAround === 0)
  {
    surrounding.forEach(tile => {
        getTileNeighbors(tiles, tile, checked, toggledData);
    })
  }
}


export default App;

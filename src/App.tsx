import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import lscache from 'lscache';

const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: 860,
    backgroundColor: '#fff',
  },
});

interface Item {
  id: number;
  title: string;
  created: { _seconds: number; _nanoseconds: number } | any;
  kudosFull: number[];
  data: {
    level: number;
  };
}

const App: React.FC = () => {
  const classes = useStyles();
  const [items, setItems] = useState<Item[]>([]);
  const [sortBy, setSortBy] = useState<'created' | 'kudosFull' | 'data.level'>('created');

  useEffect(() => {
    // get items from local storage if they are cached
    const cachedItems = lscache.get('items');
    if (cachedItems) {
      setItems(JSON.parse(cachedItems));
      return;
    }

    // otherwise fetch items from API
    fetch('https://cors-anywhere.herokuapp.com/https://api.workoutme.app/api/feed/get/')
      .then(response => response.json())
      .then(items => {
        setItems(items);
        // cache items for 1 hour in local storage to avoid unnecessary API calls (TTL)
        lscache.set('items', JSON.stringify(items, null, 4), 3600);
          
      });
  }, []);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'created' | 'kudosFull' | 'data.level');
  };

  // sort items
  const sortedItems = items
    ? [...items].filter(item => item.data !== null).sort((a, b) => {
        if (sortBy === 'created') {
          return b.created - a.created;
        } else if (sortBy === 'kudosFull') {
          return b.kudosFull.length - a.kudosFull.length;
        } else {
          const levelMap: { [key: string]: number } = {
            advanced: 3,
            medium: 2,
            newbie: 1,
            undefined: 0,
          };
          return levelMap[b.data.level] - levelMap[a.data.level];
        }
      })
    : [];

    const formatCreated = (created: { _seconds: number; _nanoseconds: number }) => {
      const date = new Date(created._seconds * 1000 + created._nanoseconds / 1000000);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };
  
  if(!sortedItems) return <div>Loading, wait please</div>;
    
  return (
    <div className={classes.root}>
      <Typography variant="h6">Sort by:</Typography>
      <select value={sortBy} onChange={handleSortChange}>
        <option value="created">Created</option>
        <option value="kudosFull">Kudos</option>
        <option value="data.level">Level</option>
      </select>
      <List component="nav" aria-label="main mailbox folders">
        {sortedItems.map(item => (
          <ListItem key={item.id}>
            <ListItemText primary={`Kudos number: ${JSON.stringify(item.kudosFull.length, null, 2)}`} secondary={`Level: ${JSON.stringify(item.data.level, null, 2)}`}/>
            Created: {formatCreated(item.created)}
          </ListItem>
      ))}
    </List>
  </div>
);
};
    
export default App;
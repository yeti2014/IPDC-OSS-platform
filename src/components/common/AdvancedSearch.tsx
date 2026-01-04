// src/components/common/AdvancedSearch.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  TuneOutlined as TuneIcon
} from '@mui/icons-material';
import { searchService, SearchResult } from '../../services/searchService';
import { ServiceRequest } from '../../types';

interface AdvancedSearchProps {
  requests: ServiceRequest[];
  onSelectRequest: (request: ServiceRequest) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  requests,
  onSelectRequest
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult<ServiceRequest>[]>([]);
  const [fuzzyMatch, setFuzzyMatch] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      const searchResults = searchService.searchRequests(requests, searchTerm, {
        fuzzyMatch,
        caseSensitive,
        minScore: 0.2
      });
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchTerm, fuzzyMatch, caseSensitive, requests]);

  const handleSelect = (request: ServiceRequest) => {
    onSelectRequest(request);
    setOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderHighlight = (text: string) => {
    return { __html: text };
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outlined"
        startIcon={<SearchIcon />}
        onClick={() => setOpen(true)}
        sx={{ minWidth: 200 }}
      >
        Advanced Search
      </Button>

      {/* Search Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Advanced Search</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Search Input */}
          <TextField
            fullWidth
            placeholder="Search by title, description, tenant, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          {/* Search Options */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TuneIcon fontSize="small" color="action" />
              <FormControlLabel
                control={
                  <Switch
                    checked={fuzzyMatch}
                    onChange={(e) => setFuzzyMatch(e.target.checked)}
                    size="small"
                  />
                }
                label="Fuzzy Match"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    size="small"
                  />
                }
                label="Case Sensitive"
              />
            </Box>
          </Paper>

          {/* Results Count */}
          {searchTerm && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {/* Search Results */}
          {searchTerm && results.length > 0 ? (
            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {results.map((result, index) => (
                <Box key={result.item.id}>
                  <ListItemButton onClick={() => handleSelect(result.item)}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="body1"
                            dangerouslySetInnerHTML={renderHighlight(
                              result.highlights.title || result.item.title
                            )}
                          />
                          <Chip
                            label={`${(result.score * 100).toFixed(0)}% match`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                            dangerouslySetInnerHTML={renderHighlight(
                              result.highlights.description ||
                                result.item.description.substring(0, 100) + '...'
                            )}
                          />
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={result.item.status.toUpperCase()}
                              size="small"
                              color={getStatusColor(result.item.status)}
                            />
                            <Chip
                              label={result.item.priority.toUpperCase()}
                              size="small"
                              color={getPriorityColor(result.item.priority)}
                            />
                            <Chip
                              label={result.item.serviceType.replace('-', ' ').toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                            {result.matchedFields.length > 0 && (
                              <Chip
                                label={`Matched: ${result.matchedFields.join(', ')}`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                  {index < results.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : searchTerm && results.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No results found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or search options
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start typing to search
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search across titles, descriptions, tenants, and more
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdvancedSearch;

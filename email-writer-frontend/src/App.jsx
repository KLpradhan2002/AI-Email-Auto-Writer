import axios from 'axios';
import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Box } from '@mui/system';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
const App = () => {

  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedReply, setGeneratedReply] = useState('')
  
  const handleSubmit=async()=>{
    setLoading(true);
    try {
      const response=await axios.post("http://localhost:8080/api/email/generate",{
        emailContent,
        tone
        });
        setGeneratedReply(typeof response.data==='string'?
          response.data : JSON.stringify(response.data)
        );
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.log();
    }finally{
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="md" sx={{py:4}}>
      <Typography variant='h3' component="h1" gutterBottom>
        Email Reply Generator
      </Typography>

      <Box sx={{mx:3}}>
        <TextField
        fullWidth
        multiline
        rows={6}
        variant='outlined'
        label="Original Email Content"
        value={emailContent || ''}
        onChange={(e)=>setEmailContent(e.target.value)}
        sx={{mb:3}}
        />

        <FormControl fullWidth sx={{mb:3}}>
          <InputLabel>Tone(Option)</InputLabel>
          <Select
            value={tone ||''}
            label="tone"
            onChange={(e)=>setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="Professional">Professional</MenuItem>
            <MenuItem value="Casula">Casula</MenuItem>
            <MenuItem value="frindly">Frindly</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" sx={{mb:3}}
        onClick={handleSubmit} disabled={!emailContent||loading}>
          {loading?<CircularProgress size={24}/>:"Generate email"}
        </Button>
      </Box>
      <Box sx={{mx:3}}>
        <TextField
        fullWidth
        multiline
        rows={6}
        variant='outlined'
        value={generatedReply || ''}
        inputProps={{readOnly:true}}
        sx={{mb:3}}
        />

        <Button 
        variant='outlined' onClick={()=>navigator.clipboard.write(generatedReply)}
        >Copy To Clipboard</Button>
      </Box>
    </Container>
  )
}

export default App
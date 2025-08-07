import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Chip,
  LinearProgress,
  Alert,
  TextField,
  Grid,
  IconButton,
} from '@mui/material'
import {
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Save,
  FileUpload,
  Help,
} from '@mui/icons-material'

interface Question {
  id: string
  text: string
  description?: string
  answer?: 'yes' | 'no' | 'na'
  comment?: string
  evidence?: string[]
}

interface Requirement {
  id: string
  title: string
  description: string
  questions: Question[]
  status: 'not-started' | 'in-progress' | 'completed'
}

const assessmentData: Requirement[] = [
  {
    id: 'req-1',
    title: 'Requirement 1: Install and maintain network security controls',
    description: 'Firewalls and routers are key components of the architecture that controls entry to and exit from the network.',
    status: 'completed',
    questions: [
      {
        id: 'q1.1',
        text: 'Are documented configuration standards established for network security controls?',
        description: 'Configuration standards must be established and maintained for all network security controls.',
        answer: 'yes',
        comment: 'We have documented firewall configuration standards updated quarterly.',
      },
      {
        id: 'q1.2',
        text: 'Are network security controls configured to prevent unauthorized access?',
        description: 'All network security controls must be configured to deny all traffic by default.',
        answer: 'yes',
      },
      {
        id: 'q1.3',
        text: 'Is a current network diagram maintained?',
        description: 'A current network diagram that shows all connections to cardholder data must be maintained.',
        answer: 'no',
        comment: 'Network diagram needs to be updated with recent infrastructure changes.',
      },
    ],
  },
  {
    id: 'req-2',
    title: 'Requirement 2: Apply secure configurations to all system components',
    description: 'Malicious individuals use default passwords and other vendor default settings to compromise systems.',
    status: 'in-progress',
    questions: [
      {
        id: 'q2.1',
        text: 'Are vendor-supplied defaults changed before installing systems on the network?',
        description: 'System passwords and other security parameters must be changed from vendor defaults.',
        answer: 'yes',
      },
      {
        id: 'q2.2',
        text: 'Are configuration standards developed for all system components?',
        description: 'Configuration standards must address all known security vulnerabilities.',
      },
      {
        id: 'q2.3',
        text: 'Are systems protected with anti-malware software?',
        description: 'All systems must be protected from malware and regularly updated.',
        answer: 'yes',
      },
    ],
  },
  {
    id: 'req-3',
    title: 'Requirement 3: Protect stored cardholder data',
    description: 'Protection methods such as encryption, truncation, masking, and hashing are critical components of cardholder data protection.',
    status: 'not-started',
    questions: [
      {
        id: 'q3.1',
        text: 'Is cardholder data storage kept to a minimum?',
        description: 'Cardholder data storage should be minimized by implementing data retention and disposal policies.',
      },
      {
        id: 'q3.2',
        text: 'Is sensitive authentication data not stored after authorization?',
        description: 'Sensitive authentication data must not be stored after authorization.',
      },
      {
        id: 'q3.3',
        text: 'Is the PAN masked when displayed?',
        description: 'PAN must be masked when displayed (the BIN and last four digits are the maximum number of digits to be displayed).',
      },
    ],
  },
]

export default function Assessment() {
  const [requirements, setRequirements] = useState<Requirement[]>(assessmentData)
  const [expandedPanel, setExpandedPanel] = useState<string | false>('req-1')

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false)
  }

  const handleAnswerChange = (reqId: string, questionId: string, answer: 'yes' | 'no' | 'na') => {
    setRequirements(reqs =>
      reqs.map(req =>
        req.id === reqId
          ? {
              ...req,
              questions: req.questions.map(q =>
                q.id === questionId ? { ...q, answer } : q
              ),
            }
          : req
      )
    )
  }

  const handleCommentChange = (reqId: string, questionId: string, comment: string) => {
    setRequirements(reqs =>
      reqs.map(req =>
        req.id === reqId
          ? {
              ...req,
              questions: req.questions.map(q =>
                q.id === questionId ? { ...q, comment } : q
              ),
            }
          : req
      )
    )
  }

  const getRequirementProgress = (req: Requirement) => {
    const answeredQuestions = req.questions.filter(q => q.answer).length
    return (answeredQuestions / req.questions.length) * 100
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in-progress':
        return 'warning'
      case 'not-started':
        return 'default'
      default:
        return 'default'
    }
  }

  const overallProgress = requirements.reduce((acc, req) => acc + getRequirementProgress(req), 0) / requirements.length

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Self-Assessment Questionnaire (SAQ)
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-4">
          Complete this questionnaire to assess your organization's PCI DSS compliance status.
        </Typography>
        
        <Card className="card-gradient mb-4">
          <CardContent>
            <Box className="flex items-center justify-between mb-2">
              <Typography variant="h6" className="font-semibold">
                Overall Progress
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {Math.round(overallProgress)}% Complete
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              className="h-2 rounded-full"
              sx={{
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#3b82f6',
                  borderRadius: '4px',
                },
              }}
            />
          </CardContent>
        </Card>

        <Alert severity="info" className="mb-4">
          <Typography variant="body2">
            This assessment covers the core PCI DSS requirements. Please answer all questions honestly and provide 
            evidence where required. Your responses will help identify areas that need attention.
          </Typography>
        </Alert>
      </Box>

      {requirements.map((requirement) => (
        <Accordion
          key={requirement.id}
          expanded={expandedPanel === requirement.id}
          onChange={handlePanelChange(requirement.id)}
          className="mb-4 card-gradient"
          sx={{
            '&:before': {
              display: 'none',
            },
            borderRadius: '12px !important',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            className="bg-gradient-to-r from-blue-50 to-indigo-50"
          >
            <Box className="flex items-center justify-between w-full mr-4">
              <Box className="flex items-center space-x-4">
                <Chip
                  label={requirement.status.replace('-', ' ')}
                  color={getStatusColor(requirement.status) as any}
                  size="small"
                />
                <div>
                  <Typography variant="h6" className="font-semibold">
                    {requirement.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {requirement.description}
                  </Typography>
                </div>
              </Box>
              <Box className="text-right">
                <Typography variant="body2" className="font-semibold text-blue-600">
                  {Math.round(getRequirementProgress(requirement))}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getRequirementProgress(requirement)}
                  className="w-20 h-1 mt-1"
                  sx={{
                    backgroundColor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#3b82f6',
                    },
                  }}
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box className="space-y-6">
              {requirement.questions.map((question) => (
                <Card key={question.id} className="border border-gray-200">
                  <CardContent>
                    <Box className="flex items-start justify-between mb-3">
                      <Typography variant="subtitle1" className="font-semibold flex-1">
                        {question.text}
                      </Typography>
                      <IconButton size="small" className="text-gray-400">
                        <Help />
                      </IconButton>
                    </Box>
                    
                    {question.description && (
                      <Typography variant="body2" className="text-gray-600 mb-4">
                        {question.description}
                      </Typography>
                    )}

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl component="fieldset">
                          <RadioGroup
                            row
                            value={question.answer || ''}
                            onChange={(e) => handleAnswerChange(requirement.id, question.id, e.target.value as 'yes' | 'no' | 'na')}
                          >
                            <FormControlLabel
                              value="yes"
                              control={<Radio color="success" />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio color="error" />}
                              label="No"
                            />
                            <FormControlLabel
                              value="na"
                              control={<Radio color="default" />}
                              label="N/A"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box className="flex items-center space-x-2">
                          {question.answer === 'yes' && (
                            <CheckCircle className="text-green-500" />
                          )}
                          {question.answer === 'no' && (
                            <Alert severity="warning" className="text-sm">
                              This requires attention
                            </Alert>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Comments / Evidence"
                          variant="outlined"
                          value={question.comment || ''}
                          onChange={(e) => handleCommentChange(requirement.id, question.id, e.target.value)}
                          placeholder="Provide additional details, evidence, or explain non-compliance..."
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box className="flex items-center space-x-2">
                          <Button
                            variant="outlined"
                            startIcon={<FileUpload />}
                            size="small"
                          >
                            Upload Evidence
                          </Button>
                          {question.evidence && question.evidence.length > 0 && (
                            <Chip
                              label={`${question.evidence.length} file(s) attached`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box className="mt-6 flex justify-end space-x-3">
        <Button variant="outlined" size="large">
          Save Draft
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Submit Assessment
        </Button>
      </Box>
    </Box>
  )
}
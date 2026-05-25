import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export default function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => <h1 style={{ color: '#667eea', marginTop: '1.5rem', marginBottom: '1rem' }} {...props} />,
          h2: ({ node, ...props }) => <h2 style={{ color: '#667eea', marginTop: '1.25rem', marginBottom: '0.75rem' }} {...props} />,
          h3: ({ node, ...props }) => <h3 style={{ color: '#667eea', marginTop: '1rem', marginBottom: '0.5rem' }} {...props} />,
          p: ({ node, ...props }) => <p style={{ lineHeight: '1.6', marginBottom: '1rem' }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }} {...props} />,
          ol: ({ node, ...props }) => <ol style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }} {...props} />,
          li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
          code: ({ node, inline, ...props }) => 
            inline ? 
              <code style={{ background: 'var(--bg, #f0f0f0)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }} {...props} /> :
              <code style={{ display: 'block', background: 'var(--bg, #f0f0f0)', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.9em' }} {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote style={{ 
              borderLeft: `4px solid #667eea`, 
              margin: '1rem 0', 
              padding: '0.5rem 1rem', 
              background: 'var(--bg, #f9f9f9)',
              borderRadius: '4px',
              fontStyle: 'italic'
            }} {...props} />
          ),
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }} {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th style={{ border: '1px solid var(--border, #ddd)', padding: '0.5rem', background: 'var(--bg, #f5f5f5)' }} {...props} />,
          td: ({ node, ...props }) => <td style={{ border: '1px solid var(--border, #ddd)', padding: '0.5rem' }} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
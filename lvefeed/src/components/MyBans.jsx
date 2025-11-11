import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const MyBans = ({ onBackClick }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-effect" style={{ 
            borderRadius: '1rem', 
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
        {/* Header with Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <motion.button
            onClick={onBackClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(107, 114, 128, 0.2)',
              color: '#9ca3af',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: 'rgba(107, 114, 128, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={14} />
            Back to Live Feed
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>📊</span>
            <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.875rem' }}>My Reports</span>
          </div>
        </div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', padding: '2rem 1rem' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.6 }}>📋</div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#f3f4f6',
            marginBottom: '0.5rem'
          }}>
            No Reports Found
          </h3>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '0.875rem',
            marginBottom: '2rem',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            You haven't made any reports yet. When you report accounts, they will appear here.
          </p>
          
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            maxWidth: '600px',
            margin: '1.5rem auto 0'
          }}>
            <div style={{
              background: 'rgba(31, 41, 55, 0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f3f4f6' }}>0</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Total Reports</div>
            </div>
            
            <div style={{
              background: 'rgba(31, 41, 55, 0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📈</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f3f4f6' }}>0</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>This Week</div>
            </div>
            
            <div style={{
              background: 'rgba(31, 41, 55, 0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f3f4f6' }}>0</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Success Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MyBans 
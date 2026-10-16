
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
const NotFound: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className=' bg-white min-h-screen flex flex-col items-center justify-center gap-4'>
            <motion.h1 initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring", bounce: 0.4 }} className='text-primary/80 text-4xl font-bold'>Oops! Page Not Found</motion.h1>
            <motion.p initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring", bounce: 0.4 }} className='text-gray-500 text-xl'>The page you're looking for doesn't exist or may have been moved</motion.p>
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}>
                <Button onClick={() => navigate('/')} className=' w-36'>
                    Back to Home
                </Button>
            </motion.div>
        </div>
    );
};

export default NotFound;

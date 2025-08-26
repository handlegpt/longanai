#!/usr/bin/env python3
"""
数据库索引应用脚本
用于在现有数据库上添加性能优化的索引
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_database_indexes():
    """应用数据库索引"""
    try:
        # 创建数据库连接
        engine = create_engine(settings.DATABASE_URL)
        
        # 读取索引SQL文件
        indexes_file = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'app', 'core', 'database_indexes.sql'
        )
        
        if not os.path.exists(indexes_file):
            logger.error(f"索引文件不存在: {indexes_file}")
            return False
        
        with open(indexes_file, 'r', encoding='utf-8') as f:
            index_sql = f.read()
        
        # 分割SQL语句
        sql_statements = [stmt.strip() for stmt in index_sql.split(';') if stmt.strip()]
        
        with engine.connect() as conn:
            for i, statement in enumerate(sql_statements, 1):
                if statement.startswith('--') or not statement:
                    continue
                
                try:
                    logger.info(f"执行索引语句 {i}/{len(sql_statements)}: {statement[:50]}...")
                    conn.execute(text(statement))
                    conn.commit()
                    logger.info(f"✅ 索引语句 {i} 执行成功")
                except SQLAlchemyError as e:
                    if "already exists" in str(e).lower():
                        logger.warning(f"⚠️ 索引已存在，跳过: {statement[:50]}...")
                    else:
                        logger.error(f"❌ 索引语句 {i} 执行失败: {e}")
                        return False
        
        logger.info("🎉 所有数据库索引应用完成！")
        return True
        
    except Exception as e:
        logger.error(f"❌ 应用数据库索引时出错: {e}")
        return False

def check_indexes():
    """检查现有索引"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # 获取所有索引
            result = conn.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes 
                WHERE schemaname = 'public'
                ORDER BY tablename, indexname;
            """))
            
            indexes = result.fetchall()
            
            logger.info(f"📊 当前数据库共有 {len(indexes)} 个索引:")
            for index in indexes:
                logger.info(f"  - {index.tablename}.{index.indexname}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 检查索引时出错: {e}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="数据库索引管理工具")
    parser.add_argument("--check", action="store_true", help="检查现有索引")
    parser.add_argument("--apply", action="store_true", help="应用索引")
    
    args = parser.parse_args()
    
    if args.check:
        check_indexes()
    elif args.apply:
        apply_database_indexes()
    else:
        # 默认执行应用索引
        apply_database_indexes()

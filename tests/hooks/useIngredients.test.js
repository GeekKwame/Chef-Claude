import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIngredients } from '../../hooks/useIngredients'

describe('useIngredients', () => {
    it('should initialize with empty array by default', () => {
        const { result } = renderHook(() => useIngredients())
        expect(result.current.ingredients).toEqual([])
    })

    it('should initialize with provided ingredients', () => {
        const initial = ['chicken', 'onion']
        const { result } = renderHook(() => useIngredients(initial))
        expect(result.current.ingredients).toEqual(initial)
    })

    it('should add ingredient when valid', () => {
        const { result } = renderHook(() => useIngredients())
        
        act(() => {
            result.current.handleInputChange({ target: { value: 'chicken' } })
        })
        
        act(() => {
            result.current.addIngredient()
        })

        expect(result.current.ingredients).toContain('chicken')
        expect(result.current.inputValue).toBe('')
    })

    it('should not add duplicate ingredients', () => {
        const { result } = renderHook(() => useIngredients(['chicken']))
        
        act(() => {
            result.current.handleInputChange({ target: { value: 'chicken' } })
        })
        
        act(() => {
            result.current.addIngredient()
        })

        expect(result.current.ingredients).toHaveLength(1)
        expect(result.current.errorMessage).toBeTruthy()
    })

    it('should remove ingredient by index', () => {
        const { result } = renderHook(() => useIngredients(['chicken', 'onion']))
        
        act(() => {
            result.current.removeIngredient(0)
        })

        expect(result.current.ingredients).toEqual(['onion'])
    })

    it('should clear all ingredients', () => {
        const { result } = renderHook(() => useIngredients(['chicken', 'onion']))
        
        act(() => {
            result.current.clearAll()
        })

        expect(result.current.ingredients).toEqual([])
        expect(result.current.inputValue).toBe('')
    })
})


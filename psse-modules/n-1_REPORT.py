# -*- coding: utf-8 -*-
"""
Created on Mon Oct 18 13:56:55 2021

@author: elrey0801
"""

# =============================================================================
# SETTING UP
# =============================================================================

import Tkinter as tk
import tkFileDialog
import pandas as pd
import os, sys
tkroot = tk.Tk()
tkroot.withdraw()

def get_file_name(name):
    print name
    in_path = tkFileDialog.askopenfilename(title=name, filetypes=[("SAV Files", "*.sav"), ("RAW Files", "*.raw")])
    print in_path
    return in_path


import pssepath
pssepath.add_pssepath()
import psspy
from psspy import _i, _f, _s
import redirect
redirect.psse2py()
psspy.psseinit(50000)
psspy.progress_output(6,'',[])
psspy.alert_output(6,'',[])
psspy.prompt_output(6,'',[])
# =============================================================================
# GETTING BASE CASE
# =============================================================================
path = os.path.dirname(os.path.abspath(globals().get("__file__", "./_")))
bus_rname = pd.read_excel(path + r'\psse_name.xlsx', sheet_name='bus_name')
t2_rname = pd.read_excel(path + r'\psse_name.xlsx', sheet_name='t2wind_name')
t3_rname = pd.read_excel(path + r'\psse_name.xlsx', sheet_name='t3wind_name')
before = get_file_name('BASE CASE')
#before = r'D:\OneDrive\PSSE_code\PSSE\LF_Tuan_42_med_A2_v34.sav'
psspy.case(before)
psspy.fdns([_i, _i, _i, _i, _i, _i, _i, _i])

# =============================================================================
# DEFINE ELEMENT CLASS
# =============================================================================

class element:
    def __init__(self, name='', fbus=0, tbus=0, third=0, ickt='0 ', etype=0):
        self.name = name
        self.rname = name
        self.fbus = fbus
        self.tbus = tbus
        self.third = third
        self.ickt = ickt
        self.etype = etype
        self.bper = 0
        self.sflow = 0
        self.rating = 0
        self.vnom = 0
        self.cont = []
        self.cont_max = 0

    def compare(self, ele):
        if self.fbus == ele.fbus and self.tbus == ele.tbus and self.third == ele.third and self.ickt == ele.ickt:
            return True
        return False
    def self_sort(self):
        self.cont.sort(key = lambda x : x[3], reverse=True)
    
    def __str__(self):
        res = '{:^15}{:<40}\n'.format('name', ele.name)
        res += '{:^15}{:<40}\n'.format('fbus', ele.fbus)
        res += '{:^15}{:<40}\n'.format('tbus', ele.tbus)
        res += '{:^15}{:<40}\n'.format('third', ele.third)
        res += '{:^15}{:<40}\n'.format('ickt', ele.ickt)
        return res


# =============================================================================
# PSSE-A2 BUS NUMBER - TYPE - NAME
# =============================================================================

ierr = psspy.bsys(0, 0, [0.0, 500.], 1, [20], 0, [], 0, [], 0, [])
ierr, a2_buses = psspy.abusint(sid=0,  flag=1, string=["NUMBER", "TYPE"])
#ierr, a2_buses_name = psspy.abuschar(0, 2, 'NAME')

#GET ONLINE BRANCH
ierr, a2_linenumb = psspy.abrnint(sid=0,  flag=1, string=["FROMNUMBER", "TONUMBER"])
ierr, a2_linechar = psspy.abrnchar(sid=0,  flag=1, string=["ID", "FROMNAME", "TONAME"])

#GET ONLINE 2 WINDING TRANSFORMER
ierr, a2_2windnumb = psspy.atrnint(sid=0,  flag=1, string=["FROMNUMBER", "TONUMBER"])
ierr, a2_2windchar = psspy.atrnchar(sid=0,  flag=1, string=["ID", "XFRNAME"])

#GET ONLINE 3 WINDING TRANSFORMER
ierr, a2_3windnumb = psspy.atr3int(sid=0,  flag=1, string=["WIND1NUMBER", "WIND2NUMBER", "WIND3NUMBER"])
ierr, a2_3windchar = psspy.atr3char(sid=0,  flag=1, string=["ID", "XFRNAME"])



line_list = []
for i in range(len(a2_linenumb[0])):
    ele_name = a2_linechar[1][i] + '- ' + a2_linechar[2][i]
    ele_id = a2_linechar[0][i]
    ele_fbus = a2_linenumb[0][i]
    ele_tbus = a2_linenumb[1][i]
    line_list.append(element(name=ele_name, fbus=ele_fbus, tbus=ele_tbus, ickt=ele_id, etype=1))

t2wind_list = []
for i in range(len(a2_2windnumb[0])):
    ele_name = a2_2windchar[1][i]
    ele_id = a2_2windchar[0][i]
    ele_fbus = a2_2windnumb[0][i]
    ele_tbus = a2_2windnumb[1][i]
    if max(psspy.busdat(ele_fbus ,'BASE')) < max(psspy.busdat(ele_tbus ,'BASE')):
        ele_fbus, ele_tbus = ele_tbus, ele_fbus
    t2wind_list.append(element(name=ele_name, fbus=ele_fbus, tbus=ele_tbus, ickt=ele_id, etype=2))

t3wind_list = []
for i in range(len(a2_3windnumb[0])):
    ele_name = a2_3windchar[1][i]
    ele_id = a2_3windchar[0][i]
    ele_fbus = a2_3windnumb[0][i]
    ele_tbus = a2_3windnumb[1][i]
    ele_third = a2_3windnumb[2][i]
    t3wind_list.append(element(name=ele_name, fbus=ele_fbus, tbus=ele_tbus, third=ele_third, ickt=ele_id, etype=3))

ele_list = line_list + t2wind_list + t3wind_list

#GET ONLINE BUS
ierr, a2_busnumb = psspy.abusint(sid=0, flag=2, string='NUMBER')
ierr, a2_buschar = psspy.abuschar(sid=0, flag=2, string='NAME')

bus_dict = dict()
for i in range(len(a2_busnumb[0])):
    bus_name = a2_buschar[0][i]
    bus_id = a2_busnumb[0][i]
    bus_dict[bus_id] = bus_name
    
#CONVERT LIST OF BUSNUMB INTO SET FOR FASTER QUERY
a2_busnumb = set(a2_busnumb[0])
#ADD BUS '0' CUZ QUERYING 3WINDTRANS WILL RETURN BUSNUM = 0 AT THIRD WINDING
#a2_busnumb.add(0)

# =============================================================================
# FUNCTION FOR GETTING REAL NAME
# =============================================================================

def get_name(ele):
    if ele.etype == 1:
        fbmask = bus_rname['BUS_ID']==ele.fbus
        frname_row = bus_rname[fbmask]
        frname = ''
        if len(frname_row) == 0 or sum(frname_row.isna().any()) > 0: 
            frname = bus_dict[ele.fbus]
        else:
            frname = frname_row.iloc[0,3]
            
        tbmask = bus_rname['BUS_ID']==ele.tbus
        trname_row = bus_rname[tbmask]
        trname = ''
        if len(trname_row) == 0 or sum(trname_row.isna().any()) > 0: 
            trname = bus_dict[ele.tbus]
        else:
            trname = trname_row.iloc[0,3]
            
        return frname + ' - ' + trname
    
    elif ele.etype == 2:
        mask = (t2_rname['FROMNUMBER']==ele.fbus) & (t2_rname['TONUMBER']==ele.tbus)
        mask = mask | ((t2_rname['FROMNUMBER']==ele.tbus) & (t2_rname['TONUMBER']==ele.fbus))
        mask = mask & (t2_rname['ID']==int(ele.ickt))
        row = t2_rname[mask]
        if len(row) == 0 or sum(row.isna().any()) > 0:
            return ele.name
        return row.iloc[0,4]
        
    elif ele.etype == 3:
        #mask = (t3_rname['WIND1NUMBER']==ele.fbus) & (t3_rname['WIND2NUMBER']==ele.tbus)
        #mask = mask | ((t3_rname['WIND1NUMBER']==ele.tbus) & (t3_rname['WIND2NUMBER']==ele.fbus))
        #mask = mask & (t3_rname['WIND3NUMBER']==ele.third) & (t3_rname['ID']==int(ele.ickt))
        mask = (t3_rname['WIND3NUMBER']==ele.third) & (t3_rname['ID']==int(ele.ickt))
        row = t3_rname[mask]
        if len(row) == 0 or sum(row.isna().any()) > 0:
            return ele.name
        return row.iloc[0,6]

    elif ele.etype == 0:
        idbusmask = bus_rname['BUS_ID']==ele.idbus
        busname_row = bus_rname[idbusmask]
        if len(busname_row) == 0 or sum(busname_row.isna().any()) > 0: 
            return ele.name
        else:
            return busname_row.iloc[0,3]

# =============================================================================
# FUNCTION FOR GETTING ELEMENT PERCENTAGE
# =============================================================================

def eper(ele):
    ierr, percent = psspy.brnmsc(ele.fbus, ele.tbus, ele.ickt, 'PCTRTA')
    if ierr != 0:
        ierr, percent = psspy.wnddat(ele.fbus, ele.tbus, ele.third, ele.ickt, 'PCTRTA')
    if percent is None:
        percent = 0
    percent = round(percent, 2)
    return percent

# =============================================================================
# FUNCTION FOR GETTING NOMINAL VOLTAGE OF AN ELEMENT
# =============================================================================

def get_vnom(ele):
    if ele.etype == 1 or ele.etype == 2:
        return max(psspy.busdat(ele.fbus ,'BASE')[1], psspy.busdat(ele.tbus ,'BASE')[1])
    if ele.etype == 3:
        return max(psspy.busdat(ele.fbus ,'BASE')[1], psspy.busdat(ele.tbus ,'BASE')[1], psspy.busdat(ele.third ,'BASE')[1])

# =============================================================================
# GETTING BASE CASE DATA
# =============================================================================

for ele in ele_list:
    ele.bper = eper(ele)

# =============================================================================
# N-1
# =============================================================================

res_line = []
res_3wind = []
tree = 0
#res_line ----> first index = 0 is the index of the element in n_1_list, second index is a list of tuples,
#               every tuple contains 2 pieces, the first is the index in ele_list, the second one is its percentage.
#for i in range(len(n_1_list)):

for ele in ele_list:
    psspy.case(before)
    if ele.etype == 1:
        branch_vol = get_vnom(ele)

        if branch_vol < 180 or branch_vol > 300:
            continue
        ierr = psspy.branch_chng(ele.fbus, ele.tbus, ele.ickt, [0,_i,_i,_i,_i,_i], 
                                 [_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f])
    elif ele.etype == 2:
        #IGNORE N-1 EVENT OF 2-WINDING TRANSFORMER
        continue
    elif ele.etype == 3:
        #IGNORE 110KV TRANSFORMER
        if get_vnom(ele) < 200 :
            continue
        psspy.three_wnd_imped_chng_3(ele.fbus, ele.tbus, ele.third, ele.ickt,
                                     [_i,_i,_i,_i,_i,_i,_i,4,_i,_i,_i,_i],
                                     [_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f,_f])
    ierr = psspy.fdns([_i, _i, _i, _i, _i, _i, _i, _i])
    if ierr == 3:
        #USE ACTIVITY TREE CUZ ISLANDS ARE EXIST
        psspy.tree(1,0)
        psspy.tree(2,1)
        tree += 1
    ierr = psspy.fdns([_i, _i, _i, _i, _i, _i, _i, _i])
    if ierr != 0:
        continue
    
    #print 'Pass'

    limit_flag = False
    cont_max = 0
    ele_max = None
    temp_per = []
    for j in range(len(ele_list)):
        e = ele_list[j]
        if ele.compare(e):
            continue
        e_percent = eper(e)
        if e_percent >= 105:
            if abs(e_percent - e.bper) <= 5:
                continue
            if e_percent > cont_max:
                cont_max = e_percent
            limit_flag = True
            temp_per.append((ele_list[j].name, ele_list[j].fbus, j, e_percent))
    if limit_flag:
        ele.cont = temp_per
        ele.cont_max = cont_max
        if ele.etype == 1:
            res_line.append(ele)
        elif ele.etype == 3:
            res_3wind.append(ele)

#SELF SORTING
for ele in res_line:
    ele.rname = get_name(ele)
    ele.self_sort()
for ele in res_3wind:
    ele.rname = get_name(ele)
    ele.self_sort()

res_line.sort(key=lambda x : x.cont_max, reverse=True)
res_3wind.sort(key=lambda x : x.cont_max, reverse=True)

# =============================================================================
# PRINTING RESULT
# =============================================================================

fb_col = []
n1name = []
oele = []
ibefore = []
iafter = []
print
print '{:=<125}'.format('')
print '{:^125}'.format('N-1 BRANCHES')
print '{:_<125}'.format('')
print '{:^15}{:<40}{:<40}{:<15}{:<15}'.format('FROMBUS_ID', 'N-1 NAME', 'OVERLOADED ELEMENT', '%I_BEFORE', '%I_AFTER')
print '{:=<125}'.format('')
for ele in res_line:
    for i in range(len(ele.cont)):
        print '{:^15}{:<40}{:<40}{:<15}{:<15}'.format(ele.fbus, ele.name, ele.cont[i][0], 
                                               ele_list[ele.cont[i][2]].bper, ele.cont[i][3])
        fb_col.append(ele.fbus)
        n1name.append(ele.rname)
        oele.append(ele.cont[i][0])
        ibefore.append(ele_list[ele.cont[i][2]].bper)
        iafter.append(ele.cont[i][3])
    print '{:-<125}'.format('')
print


print
print '{:=<125}'.format('')
print '{:^125}'.format('N-1 3-WINDING TRANSFORMER')
print '{:_<125}'.format('')
print '{:^15}{:<40}{:<40}{:<15}{:<15}'.format('FROMBUS_ID', 'N-1 NAME', 'OVERLOADED ELEMENT', '%I_BEFORE', '%I_AFTER')
print '{:=<125}'.format('')
for ele in res_3wind:
    for i in range(len(ele.cont)):
        print '{:^15}{:<40}{:<40}{:<15}{:<15}'.format(ele.fbus, ele.name, ele.cont[i][0], 
                                               ele_list[ele.cont[i][2]].bper, ele.cont[i][3])
        sys.stdout.flush()
        fb_col.append(ele.fbus)
        n1name.append(ele.rname)
        oele.append(ele.cont[i][0])
        ibefore.append(ele_list[ele.cont[i][2]].bper)
        iafter.append(ele.cont[i][3])
    print '{:-<125}'.format('')
print
sys.stdout.flush()